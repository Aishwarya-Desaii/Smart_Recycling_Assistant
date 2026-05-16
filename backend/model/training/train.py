"""
model/training/train.py
─────────────────────────────────────────────────────────
Full training loop for the waste classification model.

Model  : EfficientNet-B2 (pretrained on ImageNet via timm)
Why    : Best accuracy/speed tradeoff; runs well on CPU for inference
Output : model/weights/best.pt  (full model)
         model/weights/last.pt  (latest checkpoint)

Run: python model/training/train.py
─────────────────────────────────────────────────────────
"""

import time
from pathlib import Path

import torch
import torch.nn as nn
import timm
import yaml
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.tensorboard import SummaryWriter
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from tqdm import tqdm

from dataset import build_dataloaders, CLASSES
from augmentations import get_train_transforms, get_val_transforms


# ── Config ────────────────────────────────────────────────
with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

DEVICE      = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EPOCHS      = cfg["training"]["epochs"]
BATCH_SIZE  = cfg["training"]["batch_size"]
LR          = cfg["training"]["learning_rate"]
WD          = cfg["training"]["weight_decay"]
PATIENCE    = cfg["training"]["patience"]
NUM_WORKERS = cfg["training"]["num_workers"]
IMG_SIZE    = cfg["dataset"]["image_size"]
NUM_CLASSES = cfg["dataset"]["num_classes"]
WEIGHTS_DIR = Path(cfg["paths"]["weights_dir"])
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


# ── Model ─────────────────────────────────────────────────
def build_model() -> nn.Module:
    """
    EfficientNet-B2 pretrained on ImageNet.
    We replace the classifier head for our 6-class task.
    """
    model = timm.create_model(
        "efficientnet_b2",
        pretrained=True,
        num_classes=NUM_CLASSES,
    )
    print(f"✅ Model: EfficientNet-B2 | Params: {sum(p.numel() for p in model.parameters()):,}")
    return model.to(DEVICE)


# ── Training Helpers ──────────────────────────────────────
def train_epoch(model, loader, optimizer, criterion):
    model.train()
    running_loss, correct, total = 0.0, 0, 0

    pbar = tqdm(loader, desc="  Training", leave=False)
    for images, labels in pbar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()

        # Gradient clipping — prevents exploding gradients
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        pbar.set_postfix(loss=f"{running_loss/total:.4f}", acc=f"{correct/total:.2%}")

    return running_loss / total, correct / total


@torch.no_grad()
def eval_epoch(model, loader, criterion):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0
    all_preds, all_labels = [], []

    pbar = tqdm(loader, desc="  Validating", leave=False)
    for images, labels in pbar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

        pbar.set_postfix(acc=f"{correct/total:.2%}")

    return running_loss / total, correct / total, all_preds, all_labels


def save_confusion_matrix(labels, preds, path: Path):
    """Save confusion matrix as PNG — useful for spotting misclassifications."""
    cm = confusion_matrix(labels, preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d",
        xticklabels=CLASSES, yticklabels=CLASSES,
        cmap="Greens"
    )
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    print(f"   📊 Confusion matrix saved → {path}")


# ── Main Training Loop ────────────────────────────────────
def train():
    print(f"\n🚀 Training on: {DEVICE}")
    print(f"   Epochs: {EPOCHS} | Batch: {BATCH_SIZE} | LR: {LR}\n")

    # Data
    train_tf = get_train_transforms(IMG_SIZE)
    val_tf   = get_val_transforms(IMG_SIZE)
    train_loader, val_loader, test_loader = build_dataloaders(
        train_tf, val_tf, BATCH_SIZE, NUM_WORKERS
    )

    # Model, loss, optimizer, scheduler
    model     = build_model()
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)   # label smoothing helps generalization
    optimizer = AdamW(model.parameters(), lr=LR, weight_decay=WD)
    scheduler = CosineAnnealingLR(optimizer, T_max=EPOCHS, eta_min=1e-6)
    writer    = SummaryWriter(log_dir=cfg["paths"]["logs"])

    best_val_acc = 0.0
    patience_counter = 0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    for epoch in range(1, EPOCHS + 1):
        t0 = time.time()

        train_loss, train_acc = train_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_acc, val_preds, val_labels = eval_epoch(model, val_loader, criterion)
        scheduler.step()

        elapsed = time.time() - t0
        print(
            f"Epoch [{epoch:02d}/{EPOCHS}] "
            f"| Train Loss: {train_loss:.4f}  Acc: {train_acc:.4f} "
            f"| Val Loss: {val_loss:.4f}  Acc: {val_acc:.4f} "
            f"| LR: {scheduler.get_last_lr()[0]:.6f} "
            f"| {elapsed:.1f}s"
        )

        # TensorBoard logging
        writer.add_scalars("Loss", {"train": train_loss, "val": val_loss}, epoch)
        writer.add_scalars("Accuracy", {"train": train_acc, "val": val_acc}, epoch)

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            torch.save(model.state_dict(), WEIGHTS_DIR / "best.pt")
            print(f"   💾 New best model saved! Val Acc: {best_val_acc:.4f}")
        else:
            patience_counter += 1
            print(f"   ⏳ No improvement ({patience_counter}/{PATIENCE})")

        # Save latest checkpoint always
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "val_acc": val_acc,
        }, WEIGHTS_DIR / "last.pt")

        # Early stopping
        if patience_counter >= PATIENCE:
            print(f"\n⛔ Early stopping at epoch {epoch} (no improvement for {PATIENCE} epochs)")
            break

    writer.close()

    # ── Final Evaluation on Test Set ──────────────────────
    print("\n📋 Loading best model for test evaluation...")
    model.load_state_dict(torch.load(WEIGHTS_DIR / "best.pt", map_location=DEVICE))
    test_loss, test_acc, test_preds, test_labels = eval_epoch(model, test_loader, criterion)

    print(f"\n{'='*55}")
    print(f"  🏁 TEST RESULTS")
    print(f"  Test Loss : {test_loss:.4f}")
    print(f"  Test Acc  : {test_acc:.4f}  ({test_acc*100:.2f}%)")
    print(f"{'='*55}\n")

    print(classification_report(
        test_labels, test_preds,
        target_names=CLASSES,
        labels=list(range(len(CLASSES))),
        zero_division=0,
    ))

    save_confusion_matrix(
        test_labels, test_preds,
        WEIGHTS_DIR / "confusion_matrix.png"
    )

    print(f"\n✅ Training complete! Best val accuracy: {best_val_acc*100:.2f}%")
    print(f"   Model weights: {WEIGHTS_DIR / 'best.pt'}")


if __name__ == "__main__":
    train()
