"""
main.py — FastAPI Backend
─────────────────────────────────────────────────────────
Two endpoints:
  POST /classify  → Single item classification (EfficientNet-B2)
  POST /segment   → Multi-item segmentation   (YOLOv8-seg)

Run: python main.py
Docs: http://localhost:8000/docs
─────────────────────────────────────────────────────────
"""

import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn

from db import get_db, User, ScanHistory

# ── Setup paths so Python can find our modules ────────────
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR / "model" / "inference"))
sys.path.insert(0, str(ROOT_DIR / "model" / "training"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instances
classifier = None
segmenter = None


# ── Lifespan (replaces deprecated on_event) ──────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models once at startup, release on shutdown."""
    global classifier, segmenter
    logger.info("Loading models...")

    # Classification model (EfficientNet-B2)
    try:
        from predictor import WastePredictor
        classifier = WastePredictor()
        logger.info("✅ WastePredictor loaded successfully.")
    except Exception as e:
        logger.warning(f"⚠️ Failed to load WastePredictor: {e}")

    # Segmentation model (YOLOv8-seg)
    try:
        from seg_predictor import SegPredictor
        segmenter = SegPredictor()
        logger.info("✅ SegPredictor loaded successfully.")
    except Exception as e:
        logger.warning(f"⚠️ Failed to load SegPredictor: {e}")

    yield  # App runs here

    logger.info("Shutting down...")


app = FastAPI(
    title="Smart Recycling AI API",
    description="Classify single waste items or segment mixed-waste photos",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ─────────────────────────────────────────────

@app.get("/")
def health_check():
    """Health check — shows which models are loaded."""
    return {
        "status": "online",
        "models_loaded": {
            "classifier": classifier is not None,
            "segmenter": segmenter is not None,
        },
    }

# ── Database Schemas & Endpoints ──────────────────────────

class LoginRequest(BaseModel):
    name: str
    email: str
    role: str = "Citizen"
    location: str = "City Center"

@app.post("/users/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(name=req.name, email=req.email, role=req.role, location=req.location)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

class ScanImpactRequest(BaseModel):
    items_count: int
    points_earned: int

@app.post("/users/{user_id}/scan_impact")
def update_scan_impact(user_id: int, req: ScanImpactRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # Impact Factory calculation
    # Average 1 item = 0.5 kg of waste
    # 1 kg of waste recycled = 2.5 kg of CO2 saved
    # 21 kg of CO2 saved = 1 tree equivalent
    
    waste_kg = req.items_count * 0.5
    co2_saved = waste_kg * 2.5
    trees_saved = co2_saved / 21.0
    
    # Update user stats
    user.eco_points += req.points_earned
    user.total_waste_kg += waste_kg
    user.total_co2_saved += co2_saved
    user.trees_saved += trees_saved
    
    # Log the scan
    scan = ScanHistory(
        user_id=user.id,
        items_count=req.items_count,
        points_earned=req.points_earned,
        waste_kg=waste_kg
    )
    db.add(scan)
    db.commit()
    db.refresh(user)
    
    return {
        "eco_points": user.eco_points,
        "total_waste_kg": round(user.total_waste_kg, 2),
        "total_co2_saved": round(user.total_co2_saved, 2),
        "trees_saved": round(user.trees_saved, 2)
    }

@app.get("/users/{user_id}/history")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).order_by(ScanHistory.timestamp.desc()).all()
    return [{
        "id": s.id,
        "timestamp": s.timestamp.isoformat(),
        "items_count": s.items_count,
        "points_earned": s.points_earned,
        "waste_kg": round(s.waste_kg, 2),
        "co2_saved": round(s.waste_kg * 2.5, 2)
    } for s in scans]



@app.post("/classify")
async def classify_item(file: UploadFile = File(...)):
    """
    Single clean item → EfficientNet-B2 classification.
    Returns predicted class, confidence, top-3, and guidance.
    """
    if classifier is None:
        raise HTTPException(503, "Classifier not loaded. Train the model first.")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Uploaded file is not an image.")

    try:
        image_bytes = await file.read()
        return classifier.predict(image_bytes)
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(500, str(e))


@app.post("/segment")
async def segment_items(file: UploadFile = File(...)):
    """
    Mixed-waste photo → YOLOv8-seg instance segmentation.
    Returns annotated image (base64), per-item detections, and summary.
    """
    if segmenter is None:
        raise HTTPException(503, "Segmenter not loaded. Train the model first.")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Uploaded file is not an image.")

    try:
        image_bytes = await file.read()
        return segmenter.predict(image_bytes)
    except Exception as e:
        logger.error(f"Segmentation error: {e}")
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
