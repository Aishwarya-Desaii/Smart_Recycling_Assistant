"""
model/inference/predictor.py
─────────────────────────────────────────────────────────
WastePredictor — the class FastAPI will import and use.

Usage:
    predictor = WastePredictor()
    result = predictor.predict(image_bytes)
    # result → {"class": "plastic", "confidence": 0.94, "guidance": {...}, ...}
─────────────────────────────────────────────────────────
"""

import io
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn.functional as F
import timm
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
import yaml

from labels import IDX_TO_CLASS, get_guidance, CLASS_NAMES


# ── Config ────────────────────────────────────────────────
with open("config/config.yaml") as f:
    cfg = yaml.safe_load(f)

NUM_CLASSES  = cfg["dataset"]["num_classes"]
IMG_SIZE     = cfg["dataset"]["image_size"]
CONF_THRESH  = cfg["inference"]["confidence_threshold"]
TOP_K        = cfg["inference"]["top_k"]
WEIGHTS_PATH = Path(cfg["paths"]["best_model"])
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Preprocessing ─────────────────────────────────────────
INFERENCE_TRANSFORM = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
    ToTensorV2(),
])


class WastePredictor:
    """
    Singleton-safe predictor class.
    Load once at FastAPI startup, reuse across all requests.
    """

    def __init__(self, weights_path: Optional[Path] = None):
        self.device = DEVICE
        self.model  = self._load_model(weights_path or WEIGHTS_PATH)
        print(f"✅ WastePredictor ready on {self.device}")

    def _load_model(self, weights_path: Path) -> torch.nn.Module:
        if not weights_path.exists():
            raise FileNotFoundError(
                f"Model weights not found at {weights_path}. "
                "Run training first: python model/training/train.py"
            )

        model = timm.create_model(
            "efficientnet_b2",
            pretrained=False,
            num_classes=NUM_CLASSES,
        )
        model.load_state_dict(
            torch.load(weights_path, map_location=self.device)
        )
        model.eval()
        model.to(self.device)
        return model

    def preprocess(self, image_bytes: bytes) -> torch.Tensor:
        """Convert raw image bytes → model-ready tensor."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)
        transformed = INFERENCE_TRANSFORM(image=image_np)
        tensor = transformed["image"].unsqueeze(0)  # add batch dim
        return tensor.to(self.device)

    @torch.no_grad()
    def predict(self, image_bytes: bytes) -> dict:
        """
        Run inference on image bytes.

        Returns:
            {
                "predicted_class": "plastic",
                "confidence": 0.94,
                "is_confident": True,
                "top_predictions": [
                    {"class": "plastic", "confidence": 0.94},
                    {"class": "paper",   "confidence": 0.04},
                    {"class": "glass",   "confidence": 0.02},
                ],
                "guidance": { ... }   # from labels.py
            }
        """
        tensor = self.preprocess(image_bytes)
        logits = self.model(tensor)
        probs  = F.softmax(logits, dim=1)[0]  # [num_classes]

        # Top-K predictions
        top_probs, top_idxs = torch.topk(probs, k=TOP_K)
        top_predictions = [
            {
                "class": IDX_TO_CLASS[idx.item()],
                "confidence": round(prob.item(), 4),
            }
            for prob, idx in zip(top_probs, top_idxs)
        ]

        predicted_class = top_predictions[0]["class"]
        confidence      = top_predictions[0]["confidence"]
        is_confident    = confidence >= CONF_THRESH

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "is_confident": is_confident,
            "top_predictions": top_predictions,
            "guidance": get_guidance(predicted_class) if is_confident else None,
            "message": (
                None if is_confident
                else f"Low confidence ({confidence:.0%}). Please try a clearer image."
            ),
        }

    def predict_from_path(self, image_path: str) -> dict:
        """Convenience method for testing with file paths."""
        with open(image_path, "rb") as f:
            return self.predict(f.read())


# ── Quick CLI Test ────────────────────────────────────────
if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python predictor.py <image_path>")
        sys.exit(1)

    predictor = WastePredictor()
    result = predictor.predict_from_path(sys.argv[1])

    print(json.dumps(result, indent=2))
