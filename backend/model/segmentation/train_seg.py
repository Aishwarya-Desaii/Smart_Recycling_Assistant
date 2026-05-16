"""
model/segmentation/train_seg.py
─────────────────────────────────────────────────────────
Trains YOLOv8-seg on the TACO dataset for instance
segmentation of mixed waste items in a single photo.

Model  : YOLOv8m-seg (medium — best speed/accuracy balance)
Task   : Instance segmentation → bounding box + pixel mask per item
Output : model/weights/yolov8_waste_seg.pt

Why YOLOv8-seg over Mask R-CNN:
  - Single-stage: detection + segmentation in one pass (faster)
  - Ultralytics API is clean and production-ready
  - Easy export to ONNX for future on-device inference
  - Strong pretrained weights on COCO (includes some waste categories)

Run: python model/segmentation/train_seg.py
─────────────────────────────────────────────────────────
"""

from pathlib import Path

import yaml
from ultralytics import YOLO


# ── Config ────────────────────────────────────────────────
with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

seg_cfg      = cfg["segmentation"]
WEIGHTS_DIR  = Path(cfg["paths"]["weights_dir"])
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

DATA_YAML    = Path(seg_cfg["taco_data_yaml"])
BASE_WEIGHTS = seg_cfg["pretrained_base"]      # "yolov8m-seg.pt" — auto-downloaded
OUTPUT_NAME  = "yolov8_waste_seg"
EPOCHS       = seg_cfg["epochs"]
BATCH        = seg_cfg["batch_size"]
IMG_SIZE     = seg_cfg["image_size"]
DEVICE       = seg_cfg["device"]
CONF         = seg_cfg["confidence_threshold"]
IOU          = seg_cfg["iou_threshold"]


def train():
    print("\n🚀 Starting YOLOv8 segmentation training")
    print(f"   Base model : {BASE_WEIGHTS}")
    print(f"   Dataset    : {DATA_YAML}")
    print(f"   Epochs     : {EPOCHS} | Batch: {BATCH} | ImgSize: {IMG_SIZE}")
    print(f"   Device     : {DEVICE}\n")

    if not DATA_YAML.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_YAML}.\n"
            "Run: python scripts/prepare_taco_yolo.py first."
        )

    # Load pretrained YOLOv8m-seg (downloads ~50MB on first run)
    model = YOLO(BASE_WEIGHTS)

    # ── Train ─────────────────────────────────────────────
    results = model.train(
        data=str(DATA_YAML),
        task="segment",
        epochs=EPOCHS,
        batch=BATCH,
        imgsz=IMG_SIZE,
        device=DEVICE,

        # ── Optimizer ─────────────────────────────────────
        optimizer="AdamW",
        lr0=0.001,           # initial learning rate
        lrf=0.01,            # final LR = lr0 * lrf
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,     # gradual LR warmup

        # ── Augmentation (built-in Ultralytics mosaic) ────
        mosaic=1.0,          # mosaic augmentation — combines 4 images (great for mixed waste)
        mixup=0.1,           # blends two images + labels
        copy_paste=0.3,      # copies object instances across images — great for rare classes
        degrees=15,          # rotation
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,

        # ── Output ────────────────────────────────────────
        project="runs/segment",
        name=OUTPUT_NAME,
        save=True,
        save_period=10,      # checkpoint every 10 epochs
        exist_ok=True,

        # ── Evaluation ────────────────────────────────────
        val=True,
        conf=CONF,
        iou=IOU,

        # ── Performance ───────────────────────────────────
        workers=4,
        cache=True,          # cache images in RAM for faster training
        amp=True,            # mixed precision — faster on GPU, same accuracy
        patience=15,         # early stopping
        plots=True,          # save training curves + sample predictions
    )

    # ── Copy best weights to our standard path ─────────────
    best_src = Path(f"runs/segment/{OUTPUT_NAME}/weights/best.pt")
    best_dst = WEIGHTS_DIR / "yolov8_waste_seg.pt"

    if best_src.exists():
        import shutil
        shutil.copy2(best_src, best_dst)
        print(f"\n💾 Best model saved → {best_dst}")
    else:
        print(f"⚠️  Could not find best.pt at {best_src}")

    print(f"\n✅ Training complete!")
    print(f"   mAP50-mask : {results.results_dict.get('metrics/mAP50(M)', 'N/A'):.4f}")
    print(f"   mAP50-95   : {results.results_dict.get('metrics/mAP50-95(M)', 'N/A'):.4f}")

    return results


def validate():
    """Run validation on test split with the best saved model."""
    best = WEIGHTS_DIR / "yolov8_waste_seg.pt"
    if not best.exists():
        print("❌ No trained model found. Run train() first.")
        return

    model = YOLO(str(best))
    metrics = model.val(
        data=str(DATA_YAML),
        split="test",
        imgsz=IMG_SIZE,
        conf=CONF,
        iou=IOU,
        plots=True,
    )

    print("\n📊 Test Set Results:")
    print(f"  mAP50  (box)  : {metrics.box.map50:.4f}")
    print(f"  mAP50  (mask) : {metrics.seg.map50:.4f}")
    print(f"  mAP50-95 (mask): {metrics.seg.map:.4f}")

    return metrics


if __name__ == "__main__":
    train()
    validate()
