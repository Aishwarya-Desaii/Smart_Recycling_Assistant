"""
model/training/augmentations.py
─────────────────────────────────────────────────────────
Albumentations pipelines for train / val / test.
Train gets heavy augmentation; val/test get only resize + normalize.
─────────────────────────────────────────────────────────
"""

import albumentations as A
from albumentations.pytorch import ToTensorV2


def get_train_transforms(image_size: int = 224) -> A.Compose:
    """
    Heavy augmentation for training.
    Simulates real-world conditions: varying lighting, angles, blur.
    """
    return A.Compose([
        A.Resize(image_size, image_size),

        # ── Geometric ──────────────────────────────────────
        A.HorizontalFlip(p=0.5),
        A.Rotate(limit=30, p=0.6),
        A.Affine(
            translate_percent={"x": (-0.1, 0.1), "y": (-0.1, 0.1)},
            scale=(0.85, 1.15),
            rotate=(-20, 20), p=0.5
        ),
        A.RandomResizedCrop(
            size=(image_size, image_size),
            scale=(0.7, 1.0), p=0.4
        ),

        # ── Color / Lighting ───────────────────────────────
        A.RandomBrightnessContrast(
            brightness_limit=0.3, contrast_limit=0.3, p=0.6
        ),
        A.HueSaturationValue(
            hue_shift_limit=20, sat_shift_limit=30,
            val_shift_limit=20, p=0.5
        ),
        A.RGBShift(p=0.3),
        A.CLAHE(clip_limit=2.0, p=0.3),             # enhance low-contrast images

        # ── Noise & Blur ───────────────────────────────────
        A.GaussNoise(std_range=(0.03, 0.07), p=0.3),
        A.MotionBlur(blur_limit=5, p=0.2),
        A.GaussianBlur(blur_limit=3, p=0.2),

        # ── Occlusion ──────────────────────────────────────
        A.CoarseDropout(
            num_holes_range=(1, 8),
            hole_height_range=(10, 20),
            hole_width_range=(10, 20),
            fill=0, p=0.3
        ),

        # ── Normalize & Convert ────────────────────────────
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2(),
    ])


def get_val_transforms(image_size: int = 224) -> A.Compose:
    """Minimal transforms for validation and testing — only normalize."""
    return A.Compose([
        A.Resize(image_size, image_size),
        A.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
        ToTensorV2(),
    ])
