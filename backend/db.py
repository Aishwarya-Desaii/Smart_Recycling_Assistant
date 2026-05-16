from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./waste_smart.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="Citizen")
    location = Column(String, nullable=True)
    
    # Impact & Gamification stats
    eco_points = Column(Integer, default=0)
    total_waste_kg = Column(Float, default=0.0)
    total_co2_saved = Column(Float, default=0.0)
    trees_saved = Column(Float, default=0.0)
    current_streak = Column(Integer, default=0)

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    items_count = Column(Integer, default=1)
    points_earned = Column(Integer, default=0)
    waste_kg = Column(Float, default=0.0)
    
    user = relationship("User")

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
