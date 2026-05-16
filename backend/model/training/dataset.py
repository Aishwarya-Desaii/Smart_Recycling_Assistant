"""
model/training/dataset.py
─────────────────────────────────────────────────────────
PyTorch Dataset for the processed waste image dataset.
Reads from data/processed/{split}/{class}/ folders.
─────────────────────────────────────────────────────────
"""

from pathlib import Path
from typing import Callable, Optional

import numpy as np
from PIL import Image
from torch.utils.data import Dataset, DataLoader
import yaml


with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

CLASSES: list[str] = cfg["dataset"]["classes"]
CLASS_TO_IDX: dict[str, int] = {cls: i for i, cls in enumerate(CLASSES)}


class WasteDataset(Dataset):
    """
    Loads images from:
        data/processed/{split}/{class_name}/image.jpg

    Args:
        split       : "train" | "val" | "test"
        transform   : Albumentations Compose transform
        data_root   : override default processed data path
    """

    def __init__(
        self,
        split: str,
        transform: Optional[Callable] = None,
        data_root: Optional[str] = None,
    ):
        assert split in ("train", "val", "test"), f"Invalid split: {split}"

        root = Path(data_root or cfg["paths"]["processed_data"])
        self.split_dir = root / split
        self.transform = transform

        self.samples: list[tuple[Path, int]] = []
        self._load_samples()

    def _load_samples(self):
        """Walk split directory and collect (image_path, label) pairs."""
        for cls in CLASSES:
            cls_dir = self.split_dir / cls
            if not cls_dir.exists():
                print(f"⚠️  Missing class dir: {cls_dir}")
                continue

            label = CLASS_TO_IDX[cls]
            for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp"):
                for img_path in cls_dir.glob(ext):
                    self.samples.append((img_path, label))

        if not self.samples:
            raise RuntimeError(f"No images found in {self.split_dir}. Run prepare_dataset.py first.")

        print(f"  [{self.split_dir.name}] Loaded {len(self.samples)} images across {len(CLASSES)} classes")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        img_path, label = self.samples[idx]

        # Load as RGB numpy array (Albumentations expects numpy)
        image = np.array(Image.open(img_path).convert("RGB"))

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]   # now a torch.Tensor [C, H, W]

        return image, label

    def class_counts(self) -> dict[str, int]:
        """Return per-class image count — useful for class imbalance check."""
        counts = {cls: 0 for cls in CLASSES}
        for _, label in self.samples:
            counts[CLASSES[label]] += 1
        return counts


def get_class_weights(dataset: WasteDataset):
    """
    Compute inverse-frequency weights for WeightedRandomSampler.
    Handles class imbalance (e.g., fewer e-waste samples).
    """
    import torch

    counts = dataset.class_counts()
    total = sum(counts.values())

    weights = []
    for _, label in dataset.samples:
        cls = CLASSES[label]
        # Weight = total / (num_classes * count_of_this_class)
        w = total / (len(CLASSES) * counts[cls])
        weights.append(w)

    return torch.DoubleTensor(weights)


def build_dataloaders(
    train_transform, val_transform, batch_size: int, num_workers: int
) -> tuple[DataLoader, DataLoader, DataLoader]:
    """Build and return train / val / test DataLoaders."""
    import platform
    from torch.utils.data import WeightedRandomSampler

    train_ds = WasteDataset("train", transform=train_transform)
    val_ds   = WasteDataset("val",   transform=val_transform)
    test_ds  = WasteDataset("test",  transform=val_transform)

    # macOS: multiprocessing workers hang due to fork issues; use 0
    if platform.system() == "Darwin":
        num_workers = 0
        pin_memory = False
    else:
        pin_memory = True

    # Weighted sampler: oversample underrepresented classes during training
    sample_weights = get_class_weights(train_ds)
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(train_ds),
        replacement=True
    )

    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        sampler=sampler,        # replaces shuffle=True
        num_workers=num_workers,
        pin_memory=pin_memory,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin_memory,
    )
    test_loader = DataLoader(
        test_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=pin_memory,
    )

    return train_loader, val_loader, test_loader
