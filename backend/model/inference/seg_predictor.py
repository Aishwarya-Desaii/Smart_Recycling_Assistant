"""
model/segmentation/seg_predictor.py
─────────────────────────────────────────────────────────
SegPredictor — loaded once at FastAPI startup.

Given image bytes (from camera or gallery upload):
  1. Runs YOLOv8-seg → detects all waste items + their masks
  2. Draws colored masks + labels on the image
  3. Returns:
       - annotated_image : base64 PNG (sent directly to React)
       - detections      : list of per-item structured data
       - summary         : aggregated bins needed + total reward points

Usage:
    predictor = SegPredictor()
    result = predictor.predict(image_bytes)
─────────────────────────────────────────────────────────
"""

import io
import base64
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import yaml
from PIL import Image
from ultralytics import YOLO

from labels import get_guidance, CLASS_NAMES
OUR_CLASSES = CLASS_NAMES


# ── Config ────────────────────────────────────────────────
with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

seg_cfg     = cfg["segmentation"]
WEIGHTS     = Path(seg_cfg["yolo_weights"])
IMG_SIZE    = seg_cfg["image_size"]
CONF        = seg_cfg["confidence_threshold"]
IOU         = seg_cfg["iou_threshold"]
MAX_DET     = seg_cfg["max_detections"]
MASK_ALPHA  = seg_cfg["mask_alpha"]

# BGR colors per class for OpenCV drawing
CLASS_COLORS: dict[str, tuple] = {
    cls: tuple(color)
    for cls, color in seg_cfg["class_colors"].items()
}

CLASSES = ["plastic", "paper", "glass", "metal", "organic", "e-waste"]


class SegPredictor:
    """
    Instance segmentation predictor using YOLOv8-seg.
    Load once, call predict() per request.
    """

    def __init__(self, weights_path: Optional[Path] = None):
        path = weights_path or WEIGHTS
        if not path.exists():
            raise FileNotFoundError(
                f"Segmentation model not found at {path}.\n"
                "Run: python model/segmentation/train_seg.py"
            )
        self.model = YOLO(str(path))
        self.model.fuse()   # fuse Conv+BN layers for faster inference
        print(f"✅ SegPredictor ready — {path.name}")

    # ── Core Prediction ───────────────────────────────────

    def predict(self, image_bytes: bytes) -> dict:
        """
        Run segmentation on raw image bytes.

        Returns:
        {
          "annotated_image": "<base64 PNG>",
          "detections": [
            {
              "id": 0,
              "class": "plastic",
              "confidence": 0.91,
              "bbox": [x1, y1, x2, y2],          # pixel coords
              "mask_area_pct": 4.2,               # % of image covered
              "guidance": { bin_color, instructions, reward_points, ... }
            }, ...
          ],
          "summary": {
            "total_items": 3,
            "bins_needed": ["yellow", "blue", "green"],
            "total_reward_points": 33,
            "class_counts": {"plastic": 2, "paper": 1}
          }
        }
        """
        # Decode bytes → numpy BGR (OpenCV format)
        np_arr  = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img_bgr is None:
            raise ValueError("Could not decode image. Ensure it is a valid JPEG/PNG.")

        H, W = img_bgr.shape[:2]

        # ── Run YOLOv8-seg ────────────────────────────────
        results = self.model.predict(
            source=img_bgr,
            imgsz=IMG_SIZE,
            conf=CONF,
            iou=IOU,
            max_det=MAX_DET,
            retina_masks=True,   # full-resolution masks (better quality)
            verbose=False,
        )[0]

        # ── Parse detections ──────────────────────────────
        detections = []
        annotated  = img_bgr.copy()

        if results.masks is not None:
            masks  = results.masks.data.cpu().numpy()   # (N, H, W) binary masks
            boxes  = results.boxes
            class_ids   = boxes.cls.cpu().numpy().astype(int)
            confidences = boxes.conf.cpu().numpy()
            xyxy        = boxes.xyxy.cpu().numpy().astype(int)

            for i, (mask, cls_id, conf, box) in enumerate(
                zip(masks, class_ids, confidences, xyxy)
            ):
                if cls_id >= len(CLASSES):
                    continue

                class_name = CLASSES[cls_id]
                color      = CLASS_COLORS.get(class_name, (255, 255, 255))
                guidance   = get_guidance(class_name)

                # Resize mask to original image size
                mask_resized = cv2.resize(
                    mask, (W, H), interpolation=cv2.INTER_NEAREST
                ).astype(bool)

                mask_area_pct = round(mask_resized.sum() / (H * W) * 100, 2)

                # Draw semi-transparent colored mask
                annotated = self._draw_mask(annotated, mask_resized, color)

                # Draw bounding box
                x1, y1, x2, y2 = box
                cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

                # Draw label chip
                label_text = f"{class_name} {conf:.0%}"
                self._draw_label(annotated, label_text, (x1, y1), color)

                detections.append({
                    "id": i,
                    "class": class_name,
                    "confidence": round(float(conf), 4),
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "mask_area_pct": mask_area_pct,
                    "guidance": guidance,
                })

        # ── Encode annotated image as base64 ──────────────
        _, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 90])
        annotated_b64 = base64.b64encode(buffer).decode("utf-8")

        return {
            "annotated_image": annotated_b64,
            "detections": detections,
            "summary": self._build_summary(detections),
        }

    # ── Drawing Helpers ───────────────────────────────────

    def _draw_mask(
        self,
        image: np.ndarray,
        mask: np.ndarray,
        color: tuple,
    ) -> np.ndarray:
        """Blend a colored mask onto the image with transparency."""
        overlay = image.copy()
        overlay[mask] = color
        return cv2.addWeighted(overlay, MASK_ALPHA, image, 1 - MASK_ALPHA, 0)

    def _draw_label(
        self,
        image: np.ndarray,
        text: str,
        origin: tuple,
        color: tuple,
    ):
        """Draw a filled label chip above the bounding box."""
        x, y = origin
        font       = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness  = 1

        (tw, th), baseline = cv2.getTextSize(text, font, font_scale, thickness)
        pad = 4

        # Chip background
        cv2.rectangle(
            image,
            (x, max(0, y - th - baseline - pad * 2)),
            (x + tw + pad * 2, y),
            color, -1
        )
        # Text (white)
        cv2.putText(
            image, text,
            (x + pad, max(th, y - baseline - pad)),
            font, font_scale,
            (255, 255, 255), thickness, cv2.LINE_AA
        )

    # ── Summary Builder ───────────────────────────────────

    def _build_summary(self, detections: list[dict]) -> dict:
        """Aggregate per-item results into a scan summary."""
        if not detections:
            return {
                "total_items": 0,
                "bins_needed": [],
                "total_reward_points": 0,
                "class_counts": {},
            }

        class_counts: dict[str, int] = {}
        bins_seen: list[str] = []
        total_points = 0

        for det in detections:
            cls = det["class"]
            class_counts[cls] = class_counts.get(cls, 0) + 1

            guidance = det.get("guidance") or {}
            bin_color = guidance.get("bin_color")
            if bin_color and bin_color not in bins_seen:
                bins_seen.append(bin_color)

            total_points += guidance.get("reward_points", 0)

        return {
            "total_items": len(detections),
            "bins_needed": bins_seen,
            "total_reward_points": total_points,
            "class_counts": class_counts,
        }


# ── CLI Test ──────────────────────────────────────────────
if __name__ == "__main__":
    import sys, json

    if len(sys.argv) < 2:
        print("Usage: python seg_predictor.py <image_path>")
        sys.exit(1)

    predictor = SegPredictor()

    with open(sys.argv[1], "rb") as f:
        result = predictor.predict(f.read())

    # Print everything except the big base64 image
    result_display = {k: v for k, v in result.items() if k != "annotated_image"}
    print(json.dumps(result_display, indent=2))
    print(f"\n🖼️  Annotated image: {len(result['annotated_image'])} bytes (base64)")
