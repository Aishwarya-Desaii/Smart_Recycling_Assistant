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
        # pyrefly: ignore [missing-import]
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
    class_counts: dict = {}

@app.post("/users/{user_id}/scan_impact")
def update_scan_impact(user_id: int, req: ScanImpactRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # Impact Factory calculation with appropriate weights
    CLASS_WEIGHTS = {
        "plastic": 0.2,   # kg per item
        "paper": 0.1,     # kg per item
        "glass": 0.5,     # kg per item
        "metal": 0.3,     # kg per item
        "organic": 0.4,   # kg per item
        "e-waste": 1.0,   # kg per item
    }
    CLASS_CO2_MULTIPLIER = {
        "plastic": 3.0,   # kg CO2 saved per kg of waste
        "paper": 1.5,
        "glass": 0.3,
        "metal": 4.0,
        "organic": 0.1,
        "e-waste": 2.5,
    }
    
    waste_kg = 0.0
    co2_saved = 0.0

    if req.class_counts:
        for cls, count in req.class_counts.items():
            w = CLASS_WEIGHTS.get(cls.lower(), 0.5)
            c2_mult = CLASS_CO2_MULTIPLIER.get(cls.lower(), 2.5)
            item_waste = w * count
            waste_kg += item_waste
            co2_saved += item_waste * c2_mult
    else:
        waste_kg = req.items_count * 0.5
        co2_saved = waste_kg * 2.5

    # 21 kg of CO2 saved = 1 tree equivalent
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

class QuizSubmit(BaseModel):
    user_id: int
    answers: dict

@app.get("/educational/guidelines")
def get_guidelines():
    return [
        {"type": "Wet Waste", "color": "var(--success)", "description": "Food scraps, organic matter."},
        {"type": "Dry Waste", "color": "var(--secondary)", "description": "Paper, clean plastic, glass."},
        {"type": "Hazardous", "color": "var(--danger)", "description": "Batteries, e-waste, chemicals."},
        {"type": "Recyclable", "color": "var(--warning)", "description": "Metals, clean cardboard."}
    ]

@app.get("/educational/quiz/daily")
def get_daily_quiz():
    return [
        {
            "id": 1,
            "question": "Which of these items should NEVER be placed in a standard recycling bin?",
            "options": ["A clean cardboard box", "A greasy pizza box", "An empty plastic water bottle", "A clean glass jar"]
        },
        {
            "id": 2,
            "question": "How should you dispose of old alkaline batteries?",
            "options": ["Throw them in the regular trash", "Put them in the recycling bin", "Take them to a hazardous e-waste facility", "Compost them"]
        },
        {
            "id": 3,
            "question": "What is the correct way to recycle plastic food containers?",
            "options": ["Rinse them out before recycling", "Leave the food in them", "Put them in the compost bin", "Crush them and throw in regular trash"]
        }
    ]

@app.post("/educational/quiz/submit")
def submit_quiz(req: QuizSubmit, db: Session = Depends(get_db)):
    correct_answers = {
        "1": "A greasy pizza box",
        "2": "Take them to a hazardous e-waste facility",
        "3": "Rinse them out before recycling"
    }
    
    score = 0
    total = len(correct_answers)
    for q_id, ans in req.answers.items():
        if str(q_id) in correct_answers and correct_answers[str(q_id)] == ans:
            score += 1
            
    points_awarded = score * 10
    
    user = db.query(User).filter(User.id == req.user_id).first()
    if user and points_awarded > 0:
        user.eco_points += points_awarded
        quiz_record = ScanHistory(user_id=user.id, items_count=0, waste_kg=0.0, points_earned=points_awarded)
        db.add(quiz_record)
        db.commit()
        db.refresh(user)
        return {"score": score, "total": total, "points_awarded": points_awarded, "new_total": user.eco_points, "correct_answers": correct_answers}
        
    return {"score": score, "total": total, "points_awarded": points_awarded, "new_total": user.eco_points if user else 0, "correct_answers": correct_answers}

@app.get("/gamification/data/{user_id}")
def get_gamification_data(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # Badges calculation
    badges = []
    if user.eco_points >= 10:
        badges.append({"id": "green_champ", "name": "Green Champion", "color": "var(--success)", "icon": "Award"})
    if user.total_waste_kg >= 0.5:
        badges.append({"id": "plastic_warrior", "name": "Waste Warrior", "color": "var(--secondary)", "icon": "ShieldCheck"})
    if user.eco_points >= 100:
        badges.append({"id": "zero_waste", "name": "Zero Waste Master", "color": "var(--warning)", "icon": "Star"})
        
    # Recent activity
    history = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).order_by(ScanHistory.timestamp.desc()).limit(5).all()
    recent_activity = []
    for h in history:
        recent_activity.append({
            "id": h.id,
            "title": "Daily Quiz (Correct Answers)" if h.items_count == 0 else f"AI Waste Scan ({h.items_count} items)",
            "points": h.points_earned,
            "type": "quiz" if h.items_count == 0 else "scan"
        })
        
    # Leaderboard
    top_users = db.query(User).order_by(User.eco_points.desc()).limit(5).all()
    leaderboard = []
    user_in_top = False
    for i, u in enumerate(top_users):
        is_current = (u.id == user.id)
        if is_current: user_in_top = True
        leaderboard.append({"rank": i + 1, "name": u.name + (" (You)" if is_current else ""), "pts": u.eco_points, "highlight": is_current})
        
    if not user_in_top:
        # Find user's actual rank roughly
        rank = db.query(User).filter(User.eco_points > user.eco_points).count() + 1
        leaderboard.append({"rank": rank, "name": user.name + " (You)", "pts": user.eco_points, "highlight": True})
        
    return {
        "badges": badges,
        "recent_activity": recent_activity,
        "leaderboard": leaderboard
    }

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
# --- Community Events Mock DB ---
events_db = [
    {"id": 1, "title": "Plastic-Free Week", "description": "Join 450 neighbors in reducing plastic waste.", "points": 100, "joined": False, "color": "var(--primary)"},
    {"id": 2, "title": "Downtown Clean-up", "description": "This Saturday, 10 AM. Help the community.", "points": 200, "joined": False, "color": "var(--warning)"}
]

@app.get("/community/events")
def get_events():
    return events_db

@app.post("/community/events/{event_id}/join")
def join_event(event_id: int):
    for ev in events_db:
        if ev["id"] == event_id:
            if not ev["joined"]:
                ev["joined"] = True
            return ev
    raise HTTPException(404, "Event not found")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
