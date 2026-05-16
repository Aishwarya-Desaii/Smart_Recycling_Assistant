"""
model/segmentation/export_onnx.py
─────────────────────────────────────────────────────────
Exports the trained YOLOv8-seg model to ONNX format.

Why export to ONNX?
  - Can be run in the browser via ONNX Runtime Web (future)
  - Faster inference on CPU (no PyTorch overhead)
  - Easy to deploy on edge devices

Output: model/weights/yolov8_waste_seg.onnx

Run: python model/segmentation/export_onnx.py
─────────────────────────────────────────────────────────
"""

from pathlib import Path
import yaml
from ultralytics import YOLO


with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

seg_cfg = cfg["segmentation"]
PT_PATH   = Path(seg_cfg["yolo_weights"])
ONNX_PATH = PT_PATH.with_suffix(".onnx")
IMG_SIZE  = seg_cfg["image_size"]


def export():
    if not PT_PATH.exists():
        raise FileNotFoundError(f"Trained model not found at {PT_PATH}. Train first.")

    print(f"📦 Exporting {PT_PATH.name} → ONNX...")

    model = YOLO(str(PT_PATH))
    model.export(
        format="onnx",
        imgsz=IMG_SIZE,
        opset=12,          # broad compatibility
        simplify=True,     # graph simplification — smaller, faster
        dynamic=False,     # fixed batch size = 1 (for mobile/server inference)
        half=False,        # FP32 for CPU compatibility (use half=True for GPU-only)
    )

    print(f"✅ ONNX model saved → {ONNX_PATH}")
    print(f"   Size: {ONNX_PATH.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    export()
