import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Coins, Bell, LogOut, Users, Send, MapPin, Navigation, Route, Wallet, Calendar, ShieldCheck, AlertTriangle, CheckCircle, Activity, Award, BookOpen, Gift, PlayCircle, Star, Truck } from 'lucide-react';
import './App.css';
import WasteScanning from './components/WasteScanning';
import CitizenDashboard from './components/CitizenDashboard';

import AIChatAssistant from './components/AIChatAssistant';
import PickupScheduling from './components/PickupScheduling';

const WasteSegregation = ({ userProfile, setEcoPoints }) => {
  const [guidelines, setGuidelines] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/educational/guidelines')
      .then(res => res.json())
      .then(data => setGuidelines(data))
      .catch(e => console.error(e));

    fetch('http://localhost:8000/educational/quiz/daily')
      .then(res => res.json())
      .then(data => setQuiz(data))
      .catch(e => console.error(e));
  }, []);

  const handleQuizSubmit = async () => {
    if (Object.keys(quizAnswers).length !== quiz.length || !userProfile?.id) return;
    try {
      const res = await fetch('http://localhost:8000/educational/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userProfile.id, answers: quizAnswers })
      });
      const data = await res.json();
      setQuizFeedback(`You scored ${data.score}/${data.total}! You earned ${data.points_awarded} EcoPoints!`);
      if (data.points_awarded > 0) {
        setEcoPoints(data.new_total);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><BookOpen color="var(--primary)" /> Waste Segregation & Info</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Segregation Guidelines</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {guidelines.length > 0 ? guidelines.map((g, i) => (
              <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: g.color }}></div>
                <strong>{g.type}:</strong> {g.description}
              </li>
            )) : <p>Loading guidelines...</p>}
          </ul>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Awareness & Quizzes</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Take the daily quiz to improve your knowledge and earn bonus points!</p>
          
          {quiz.length > 0 && !quizFeedback ? (
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {quiz.map((q, idx) => (
                <div key={q.id}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.8rem' }}>{idx + 1}. {q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name={`quiz_${q.id}`} value={opt} onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn-primary" onClick={handleQuizSubmit} style={{ width: '100%', marginTop: '0.5rem' }} disabled={Object.keys(quizAnswers).length !== quiz.length}>
                <Award size={18} /> Submit Answers
              </button>
            </div>
          ) : quizFeedback ? (
            <div style={{ padding: '1.5rem', background: quizFeedback.includes('earned 0') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: quizFeedback.includes('earned 0') ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem' }}>
              {quizFeedback}
            </div>
          ) : <p>Loading quiz...</p>}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>
            <PlayCircle size={16} /> <span>Watch: How to compost at home</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunityImpact = ({ userProfile }) => {
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (userProfile?.id) {
      fetch(`http://localhost:8000/users/${userProfile.id}/history`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(e => console.error(e));
    }
    
    fetch('http://localhost:8000/community/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(e => console.error(e));
  }, [userProfile?.id, userProfile?.eco_points]);

  const handleShare = async () => {
    const text = `I just recycled ${userProfile?.total_waste_kg?.toFixed(2) || 0}kg of waste and saved ${userProfile?.total_co2_saved?.toFixed(2) || 0}kg of CO₂ on the EcoSmart Platform! Join me in saving the planet! 🌍♻️`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Eco Impact', text: text, url: window.location.href });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Impact stats copied to clipboard! You can now paste and share them.");
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:8000/community/events/${eventId}/join`, { method: 'POST' });
      const updatedEvent = await res.json();
      setEvents(events.map(ev => ev.id === eventId ? updatedEvent : ev));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Users color="var(--primary)" /> Community & Impact</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Your Impact Tracker</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Waste Recycled:</span> <strong>{userProfile?.total_waste_kg ? userProfile.total_waste_kg.toFixed(2) : 0} kg</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CO₂ Saved:</span> <strong>{userProfile?.total_co2_saved ? userProfile.total_co2_saved.toFixed(2) : 0} kg</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Trees Saved:</span> <strong>{userProfile?.trees_saved ? userProfile.trees_saved.toFixed(2) : 0}</strong></div>
          </div>
          
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.8rem', color: 'var(--text-main)' }}>Scan History</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(history) && history.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scans yet.</p> : Array.isArray(history) ? history.map(item => (
              <div key={item.id} style={{ background: 'var(--bg-card)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <strong>{new Date(item.timestamp).toLocaleDateString()}</strong>
                  <span style={{ color: 'var(--success)' }}>+{item.points_earned} Pts</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {item.items_count} items ({item.waste_kg}kg waste) ➔ {item.co2_saved}kg CO₂ saved
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)' }}>Error loading history.</p>}
          </div>
          
          <button className="btn-primary" onClick={handleShare} style={{ width: '100%', marginTop: '1.5rem', background: 'var(--primary)' }}><Send size={16} /> Share on Social Media</button>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Local Events & Challenges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.length > 0 ? events.map(ev => (
              <div key={ev.id} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px' }}>
                <h4 style={{ color: ev.color, marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                  {ev.title} <span style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'var(--glass-border-light)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>{ev.points} Pts</span>
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{ev.description}</p>
                <button 
                  className="btn-primary" 
                  onClick={() => handleJoinEvent(ev.id)}
                  disabled={ev.joined}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: ev.joined ? 'var(--text-muted)' : 'var(--primary)', cursor: ev.joined ? 'not-allowed' : 'pointer' }}
                >
                  {ev.joined ? 'Joined ✓' : 'Join Challenge'}
                </button>
              </div>
            )) : <p>Loading events...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardsGamification = ({ userProfile, ecoPoints, setEcoPoints }) => {
  const [data, setData] = useState({ badges: [], recent_activity: [], leaderboard: [] });
  const [redeemed, setRedeemed] = useState(null);

  useEffect(() => {
    if (userProfile?.id) {
      fetch(`http://localhost:8000/gamification/data/${userProfile.id}`)
        .then(res => res.json())
        .then(d => setData(d))
        .catch(e => console.error(e));
    }
  }, [userProfile?.id, ecoPoints]);

  const IconMap = {
    Award: <Award size={30} />,
    ShieldCheck: <ShieldCheck size={30} />,
    Star: <Star size={30} />
  };

  const coupons = [
    { id: 1, label: 'Electricity Bill', cost: 100, discount: 5, color: 'var(--warning)' },
    { id: 2, label: 'Water Bill', cost: 200, discount: 10, color: 'rgb(59, 130, 246)' },
    { id: 3, label: 'Gas Bill', cost: 500, discount: 25, color: 'var(--secondary)' },
    { id: 4, label: 'Property Tax', cost: 1000, discount: 50, color: 'var(--primary)' },
  ];

  const handleRedeem = (coupon) => {
    if (ecoPoints < coupon.cost) return;
    setEcoPoints(prev => prev - coupon.cost);
    const code = `ECO-${coupon.label.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRedeemed({ ...coupon, code });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', backgroundImage: 'url(/eco_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}><Gift color="var(--primary)" /> Rewards & Gamification</h2>
        <div style={{ textAlign: 'right' }}>
          <span style={{ padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>100 pts = ₹5 | Balance: {ecoPoints} pts</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Redeem Rewards</h3>

          {redeemed ? (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '2px dashed var(--success)', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>🎉 Coupon Redeemed!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{redeemed.label} — ₹{redeemed.discount} OFF</p>
              <div style={{ padding: '0.8rem 1.5rem', background: 'var(--bg-card)', borderRadius: '10px', display: 'inline-block', border: '2px dashed var(--primary)', marginBottom: '0.8rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Coupon Code</p>
                <h3 style={{ color: 'var(--primary)', letterSpacing: '2px', margin: 0 }}>{redeemed.code}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => { navigator.clipboard.writeText(redeemed.code); alert('Copied!'); }}>Copy Code</button>
                <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={() => setRedeemed(null)}>Redeem More</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {coupons.map(c => {
                const canAfford = ecoPoints >= c.cost;
                return (
                  <button key={c.id} className="btn-primary" onClick={() => canAfford && handleRedeem(c)} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', justifyContent: 'space-between', opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed', borderLeft: `4px solid ${c.color}` }}>
                    <span>{c.label} (₹{c.discount} OFF)</span>
                    <span style={{ color: canAfford ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>-{c.cost} Pts</span>
                  </button>
                );
              })}
            </div>
          )}
          
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Badges & Achievements</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {data.badges.length > 0 ? data.badges.map(b => (
              <div key={b.id} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${b.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color }} title={b.name}>
                {IconMap[b.icon]}
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Scan waste to earn your first badge!</p>}
          </div>
          
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Recent Points Earned</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '200px', overflowY: 'auto' }}>
            {data.recent_activity.length > 0 ? data.recent_activity.map(act => (
              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: `3px solid ${act.type === 'quiz' ? 'var(--success)' : 'var(--primary)'}` }}>
                <span>{act.title}</span> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+{act.points} Pts</span>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent activity.</p>}
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award /> Leaderboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.leaderboard.length > 0 ? data.leaderboard.map(u => (
              <div key={u.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: u.highlight ? 'rgba(16, 185, 129, 0.15)' : 'var(--glass-border)', borderRadius: '8px', border: u.highlight ? '1px solid var(--primary)' : 'none' }}>
                <span style={{ fontWeight: 'bold' }}>#{u.rank} &nbsp; {u.name}</span><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{u.pts} Pts</span>
              </div>
            )) : <p style={{ color: 'var(--text-muted)' }}>Loading leaderboard...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MapLocator = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const openDirections = (destination) => {
    const query = encodeURIComponent(destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const openFullMap = () => {
    if (location) {
      window.open(`https://www.google.com/maps/search/recycling+center/@${location.lat},${location.lng},13z`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/recycling+center`, '_blank');
    }
  };

  const centers = [
    { name: "Local E-Waste Facility", type: "Batteries, Electronics Only", time: "Open until 5PM" },
    { name: "City Municipal Recycling", type: "Paper, Cardboard, Metals", time: "Open 24/7" },
    { name: "Green Earth Dropoff", type: "All Plastics, Glass", time: "Open until 7PM" }
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin color="var(--primary)" /> Nearby Recycling Centers
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        {loading ? "Locating you..." : (location ? "Found your location! Showing certified drop-off zones near you." : "Enable location services to find the closest drop-off zones.")}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {centers.map((c, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>{c.name}</h3>
                {location && <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Near you</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Accepts: {c.type}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{c.time}</span>
                <button className="btn-primary" onClick={() => openDirections(c.name)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}>
                  <Navigation size={14} style={{ display: 'inline', marginRight: '0.2rem' }} /> Directions
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="map-container" style={{ position: 'relative', minHeight: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0, minHeight: '400px' }} 
            loading="lazy" 
            allowFullScreen 
            src={`https://maps.google.com/maps?q=recycling+center${location ? `+@${location.lat},${location.lng}` : ''}&z=13&output=embed`}
          ></iframe>
          <button className="btn-primary" onClick={openFullMap} style={{ position: 'absolute', bottom: 20, right: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.3)', background: 'var(--secondary)' }}>
            <MapPin size={18} /> Open Full Map
          </button>
        </div>
      </div>
    </div>
  );
};

const TruckSchedule = ({ pickups }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Truck color="var(--primary)" /> Mobile Collection Trucks
    </h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
      Find the scheduled mobile pickup trucks in your area today. Go to these locations to throw your trash directly into the collection vehicle.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      {pickups.map((truck, i) => (
        <div key={truck.id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>{truck.id}</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Active Today</span>
          </div>
          <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={16} color="var(--primary)" /> {truck.address}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Accepts: {truck.type}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {truck.time || 'Ongoing'}
            </span>
            <button className="btn-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address)}`, '_blank')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}>
              <Navigation size={14} style={{ display: 'inline', marginRight: '0.2rem' }} /> Go Here
            </button>
          </div>
        </div>
      ))}
      {pickups.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No trucks currently scheduled.</p>}
    </div>
  </div>
);

const RecyclerDashboard = ({ userProfile, setActiveTab, ecoPoints, pickups }) => (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    {/* Welcome Hero */}
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at left, rgba(139, 92, 246, 0.15), transparent), var(--glass-bg)' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Collector Route: <span className="text-gradient purple">{userProfile?.name || 'Driver'}</span> 🚛</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Shift started at 06:00 AM. You have <strong>{pickups.length} active requests</strong> in your assigned zones today.</p>
    </div>

    {/* Primary Action: Active Pickups */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('pickups')} style={{ gridColumn: 'span 8', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="stat-icon purple" style={{ width: '80px', height: '80px', fontSize: '2.5rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}><Route size={40} /></div>
        <div className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary)', border: 'none' }}>Start Navigation <Navigation size={18} /></div>
      </div>
      <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Next: {pickups.length > 0 ? `${pickups[0].id} (${pickups[0].type})` : 'No upcoming pickups'}</h3>
      <p style={{ color: 'var(--text-muted)' }}>{pickups.length > 0 ? pickups[0].address : 'You have completed all pickups for today.'}</p>
    </div>

    {/* Earnings Widget */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('earnings')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="stat-icon orange" style={{ width: '60px', height: '60px', marginBottom: '1rem', boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)' }}><Wallet size={30} /></div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 'bold' }}>Today's Est. Earnings</p>
      <h3 style={{ fontSize: '2.8rem', color: 'var(--warning)', fontWeight: 'bold' }}>₹{ecoPoints}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>.00</span></h3>
    </div>
  </div>
);

const RecyclerPickups = ({ setEcoPoints, pickups, setPickups, setCompletedPickups, setNotifications }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ type: '', address: '' });

  const handleNavigate = (address) => {
    // Open Google Maps Directions in a new tab
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const handleComplete = (id, points) => {
    const completed = pickups.find(p => p.id === id);
    setPickups(pickups.filter(p => p.id !== id));
    if (completed && setCompletedPickups) {
      setCompletedPickups(prev => [{ ...completed, completedAt: new Date().toISOString() }, ...prev]);
    }
    if (setEcoPoints) {
      setEcoPoints(prev => prev + points);
    }
    if (setNotifications) {
      setNotifications(prev => [{ id: Date.now(), text: `Pickup ${id} completed! +₹${points} earned`, time: 'Just now', unread: true }, ...prev]);
    }
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newRoute.type || !newRoute.address) return;
    const newId = `PK-${Math.floor(100 + Math.random() * 900)}`;
    setPickups([...pickups, { id: newId, type: newRoute.type, address: newRoute.address, points: Math.floor(Math.random() * 50) + 20, time: 'New Route' }]);
    setNewRoute({ type: '', address: '' });
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>Active Pickups Queue</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {showAddForm ? 'Cancel' : '+ Add Route'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRoute} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Waste Type</label>
            <input type="text" placeholder="e.g., Household Trash" value={newRoute.type} onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ flex: '2', minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pickup Address</label>
            <input type="text" placeholder="Enter exact location..." value={newRoute.address} onChange={(e) => setNewRoute({ ...newRoute, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ height: '42px' }}>Confirm Route</button>
          </div>
        </form>
      )}

      {pickups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3>All caught up!</h3>
          <p>No active pickups in your queue right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pickups.map(pickup => (
            <div key={pickup.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{pickup.id} - {pickup.type}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="var(--primary)" /> {pickup.address}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleNavigate(pickup.address)}
                >
                  <Navigation size={16} /> Navigate
                </button>
                <button 
                  className="btn-primary" 
                  style={{ background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleComplete(pickup.id, pickup.points)}
                >
                  <CheckCircle size={16} /> Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RecyclerEarnings = ({ ecoPoints, completedPickups }) => {
  const todayStr = new Date().toDateString();
  const todayEarnings = completedPickups.filter(p => new Date(p.completedAt).toDateString() === todayStr).reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet color="var(--warning)" /> Earnings Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--warning)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Balance</p>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--warning)', fontWeight: 'bold' }}>₹{ecoPoints}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Today's Earnings</p>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{todayEarnings}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.5)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Pickups Done</p>
          <h3 style={{ fontSize: '2.5rem', color: 'rgb(139, 92, 246)', fontWeight: 'bold' }}>{completedPickups.length}</h3>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Transaction History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
        {completedPickups.length > 0 ? completedPickups.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {p.address}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.completedAt).toLocaleString()}</p>
            </div>
            <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>+₹{p.points}</span>
          </div>
        )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No completed pickups yet. Complete pickups to see earnings here.</p>}
      </div>

      {ecoPoints > 0 && (
        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--warning)', fontSize: '1rem', padding: '0.9rem' }} onClick={() => alert(`Withdrawal of ₹${ecoPoints} initiated! Funds will be transferred within 24 hours.`)}>
          <Wallet size={18} /> Withdraw ₹{ecoPoints} to Bank
        </button>
      )}
    </div>
  );
};

const NGODashboard = ({ setActiveTab, campaigns, volunteers }) => {
  const totalCollected = campaigns.reduce((s, c) => s + c.collected, 0);
  const activeVols = volunteers.filter(v => v.status === 'active').length;
  const activeCampaign = campaigns.find(c => c.status === 'active');

  return (
    <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), var(--glass-bg)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Community Impact Hub 🤝</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>Managing <strong>{campaigns.length} campaigns</strong> with <strong>{activeVols} active volunteers</strong>. Total waste collected: <strong>{totalCollected}kg</strong>.</p>
      </div>

      <div className="glass-panel stat-card" onClick={() => setActiveTab('campaigns')} style={{ gridColumn: 'span 7', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="stat-icon blue" style={{ width: '70px', height: '70px', boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}><Calendar size={35} /></div>
          <span style={{ padding: '0.5rem 1rem', background: activeCampaign ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: activeCampaign ? 'var(--success)' : 'var(--danger)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>{activeCampaign ? 'LIVE NOW' : 'NO ACTIVE'}</span>
        </div>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{activeCampaign ? activeCampaign.title : 'No Active Campaign'}</h3>
        {activeCampaign && <>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', margin: '1rem 0', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (activeCampaign.collected / activeCampaign.goal) * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary)', transition: 'width 0.5s ease' }}></div>
          </div>
          <p style={{ color: 'var(--text-muted)' }}><strong>{activeCampaign.collected}kg</strong> / {activeCampaign.goal}kg Goal. {activeCampaign.participants} Citizens Active.</p>
        </>}
      </div>

      <div className="glass-panel stat-card" onClick={() => setActiveTab('volunteers')} style={{ gridColumn: 'span 5', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-icon green" style={{ width: '60px', height: '60px', marginBottom: '1.5rem' }}><Users size={30} /></div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Volunteer Network</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Manage assignments and verify hours.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{activeVols}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>Active<br />Members</span>
        </div>
      </div>
    </div>
  );
};

const NGOCampaigns = ({ campaigns, setCampaigns }) => {
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', goal: 100 });

  const handleCreate = (e) => {
    e.preventDefault();
    setCampaigns([...campaigns, {
      id: Date.now(), title: newCampaign.title, description: newCampaign.description,
      goal: Number(newCampaign.goal), collected: 0, participants: 0, status: 'active',
      color: ['var(--primary)', 'var(--secondary)', 'var(--warning)'][campaigns.length % 3]
    }]);
    setNewCampaign({ title: '', description: '', goal: 100 });
    setShowForm(false);
  };

  const addProgress = (id, amount) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const nc = Math.min(c.collected + amount, c.goal);
        return { ...c, collected: nc, participants: c.participants + 1, status: nc >= c.goal ? 'completed' : 'active' };
      }
      return c;
    }));
  };

  const toggleStatus = (id) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Calendar color="var(--primary)" /> Campaign Manager</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Campaign'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Campaign Title</label>
            <input type="text" value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} placeholder="e.g., River Cleanup Drive" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ flex: '2', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description</label>
            <input type="text" value={newCampaign.description} onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })} placeholder="Brief description..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ minWidth: '120px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Goal (kg)</label>
            <input type="number" value={newCampaign.goal} onChange={e => setNewCampaign({ ...newCampaign, goal: e.target.value })} min="10" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ height: '42px' }}>Create Campaign</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {campaigns.map(c => {
          const pct = Math.min(100, Math.round((c.collected / c.goal) * 100));
          return (
            <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: `4px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{c.title}</h3>
                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 'bold', background: c.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : c.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: c.status === 'active' ? 'var(--success)' : c.status === 'completed' ? 'rgb(59, 130, 246)' : 'var(--danger)' }}>{c.status.toUpperCase()}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{c.description}</p>
              <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '5px', transition: 'width 0.5s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><strong>{c.collected}kg</strong> / {c.goal}kg ({pct}%) • {c.participants} participants</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {c.status !== 'completed' && <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addProgress(c.id, 25)}>+ 25kg Progress</button>}
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: c.status === 'active' ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(c.id)}>{c.status === 'active' ? 'Pause' : 'Resume'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NGOVolunteers = ({ volunteers, setVolunteers, campaigns }) => {
  const [showForm, setShowForm] = useState(false);
  const [newVol, setNewVol] = useState({ name: '', role: 'Volunteer', campaign: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    setVolunteers([...volunteers, { id: Date.now(), name: newVol.name, role: newVol.role, hours: 0, campaign: newVol.campaign, status: 'active' }]);
    setNewVol({ name: '', role: 'Volunteer', campaign: '' });
    setShowForm(false);
  };

  const toggleStatus = (id) => setVolunteers(volunteers.map(v => v.id === id ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v));
  const logHours = (id, hrs) => setVolunteers(volunteers.map(v => v.id === id ? { ...v, hours: v.hours + hrs } : v));

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Users color="var(--primary)" /> Volunteer Manager</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Volunteer'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={newVol.name} onChange={e => setNewVol({ ...newVol, name: e.target.value })} placeholder="Full name" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role</label>
            <select value={newVol.role} onChange={e => setNewVol({ ...newVol, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
              <option value="Volunteer">Volunteer</option><option value="Coordinator">Coordinator</option><option value="Field Lead">Field Lead</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Assign Campaign</label>
            <select value={newVol.campaign} onChange={e => setNewVol({ ...newVol, campaign: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required>
              <option value="">Select...</option>
              {campaigns.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn-primary" style={{ height: '42px' }}>Add Volunteer</button></div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {volunteers.map(v => (
          <div key={v.id} className="glass-panel" style={{ padding: '1.2rem', background: 'var(--bg-card)', border: `1px solid ${v.status === 'active' ? 'var(--success)' : 'var(--border-color)'}`, opacity: v.status === 'active' ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-main)' }}>{v.name}</strong>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: v.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: v.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>{v.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.role} • {v.campaign}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0' }}>{v.hours} hrs logged</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => logHours(v.id, 2)}>+2 hrs</button>
              <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: v.status === 'active' ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(v.id)}>{v.status === 'active' ? 'Deactivate' : 'Activate'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({ adminStats, setActiveTab }) => (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    {/* Header */}
    <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><ShieldCheck color="var(--primary)" size={35} /> Command Center</h2>
        <p style={{ color: 'var(--text-muted)' }}>City-wide IoT waste tracking and fleet operations.</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}><AlertTriangle size={16} /> 2 Overloaded Bins</div>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}><CheckCircle size={16} /> System Nominal</div>
      </div>
    </div>

    {/* KPI Metrics */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('analytics')} style={{ gridColumn: 'span 4', cursor: 'pointer', borderTop: '4px solid var(--primary)', padding: '1.5rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL RECYCLED (MONTH)</p>
      <h3 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>1,245 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Tons</span></h3>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('fleet')} style={{ gridColumn: 'span 4', cursor: 'pointer', borderTop: '4px solid var(--secondary)', padding: '1.5rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>ACTIVE FLEET</p>
      <h3 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>42 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Trucks Deployed</span></h3>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('analytics')} style={{ gridColumn: 'span 4', cursor: 'pointer', borderTop: '4px solid var(--warning)', padding: '1.5rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>CITIZEN ENGAGEMENT</p>
      <h3 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>8.4k <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Active Users</span></h3>
    </div>

    {/* Live Chart */}
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'rgba(20, 20, 25, 0.95)', border: '1px solid var(--glass-border)' }}>
      <h3 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><Activity size={20} color="var(--primary)" /> Real-Time Zone Activity (Live Flow)</h3>
      <div className="bar-chart" style={{ height: '250px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '30px' }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '1px', background: 'var(--bg-card)' }}></div>
        <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'var(--bg-card)' }}></div>
        {adminStats.map(stat => (
          <div key={stat.zone} className="bar animate-float" style={{ width: '60px', height: `${stat.val}%`, background: `linear-gradient(to top, rgba(16, 185, 129, 0.2), var(--primary))`, borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 -5px 20px rgba(16, 185, 129, 0.2)' }}>
            <span style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.1rem' }}>{stat.val}</span>
            <span style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{stat.zone}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminFleet = ({ fleetTrucks, setFleetTrucks, pickups }) => {
  const toggleTruckStatus = (id) => {
    setFleetTrucks(fleetTrucks.map(t => {
      if (t.id === id) {
        const next = t.status === 'active' ? 'idle' : t.status === 'idle' ? 'maintenance' : 'active';
        return { ...t, status: next, capacity: next === 'maintenance' ? 0 : next === 'idle' ? 30 : 75 };
      }
      return t;
    }));
  };

  const statusColor = (s) => s === 'active' ? 'var(--success)' : s === 'idle' ? 'var(--warning)' : 'var(--danger)';
  const activeTrucks = fleetTrucks.filter(t => t.status === 'active').length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Truck color="var(--primary)" /> Fleet Management</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>{activeTrucks} Active</span>
          <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>{fleetTrucks.filter(t => t.status === 'idle').length} Idle</span>
          <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>{fleetTrucks.filter(t => t.status === 'maintenance').length} Maintenance</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {fleetTrucks.map(t => (
          <div key={t.id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderTop: `4px solid ${statusColor(t.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={20} /> {t.id}</h3>
              <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 'bold', background: `${statusColor(t.status)}22`, color: statusColor(t.status) }}>{t.status.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Zone:</span><strong>{t.zone}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Driver:</span><strong>{t.driver}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Capacity:</span><strong>{t.capacity}%</strong></div>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${t.capacity}%`, height: '100%', background: t.capacity > 80 ? 'var(--danger)' : t.capacity > 50 ? 'var(--warning)' : 'var(--success)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
            </div>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', background: statusColor(t.status) }} onClick={() => toggleTruckStatus(t.id)}>
              Cycle Status → {t.status === 'active' ? 'Idle' : t.status === 'idle' ? 'Maintenance' : 'Active'}
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Current Pickup Assignments</h3>
      {pickups.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {pickups.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {p.address}</p>
              </div>
              <span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.time}</span>
            </div>
          ))}
        </div>
      ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>All pickups have been completed.</p>}
    </div>
  );
};

const AdminAnalytics = ({ adminStats, pickups, completedPickups, fleetTrucks }) => {
  const totalRecycled = completedPickups.reduce((s, p) => s + p.points, 0);
  const activeTrucks = fleetTrucks.filter(t => t.status === 'active').length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity color="var(--primary)" /> City Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Recycled Points</p>
          <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{totalRecycled}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--secondary)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Active Fleet</p>
          <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{activeTrucks} / {fleetTrucks.length}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--warning)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Pending Pickups</p>
          <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{pickups.length}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--success)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Completed Today</p>
          <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{completedPickups.length}</h3>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(20, 20, 25, 0.95)', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><Activity size={20} color="var(--primary)" /> Real-Time Zone Activity</h3>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '30px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, width: '100%', height: '1px', background: 'var(--bg-card)' }}></div>
          <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'var(--bg-card)' }}></div>
          {adminStats.map(stat => (
            <div key={stat.zone} style={{ width: '60px', height: `${stat.val}%`, background: 'linear-gradient(to top, rgba(16, 185, 129, 0.2), var(--primary))', borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 -5px 20px rgba(16, 185, 129, 0.2)' }}>
              <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>{stat.val}</span>
              <span style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{stat.zone}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Completed Pickups</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto' }}>
        {completedPickups.length > 0 ? completedPickups.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.completedAt).toLocaleString()}</p>
            </div>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Done</span>
          </div>
        )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No completed pickups to display.</p>}
      </div>
    </div>
  );
};



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userProfile, setUserProfile] = useState({ name: 'User', role: 'Citizen', location: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome to EcoSmart City Platform!", time: "Just now", unread: true }]);
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [adminStats, setAdminStats] = useState([{ zone: 'North', val: 45 }, { zone: 'South', val: 62 }, { zone: 'East', val: 30 }]);
  const defaultPickups = [
    { id: 'PK-101', type: 'Bulk E-Waste', address: 'Mahalakshmi Temple, Kolhapur, Maharashtra', points: 50, time: '10:00 AM - 11:30 AM' },
    { id: 'PK-102', type: 'Industrial Scrap', address: 'Rankala Lake, Kolhapur, Maharashtra', points: 100, time: '01:00 PM - 02:30 PM' },
    { id: 'PK-103', type: 'Mixed Recycling', address: 'Shivaji University, Kolhapur, Maharashtra', points: 30, time: '04:00 PM - 05:30 PM' }
  ];
  const [pickups, setPickups] = useState(() => {
    try { const saved = localStorage.getItem('ecosmart_pickups'); return saved ? JSON.parse(saved) : defaultPickups; }
    catch { return defaultPickups; }
  });
  const [completedPickups, setCompletedPickups] = useState(() => {
    try { const saved = localStorage.getItem('ecosmart_completed'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Plastic-Free Week', description: 'Join 450 neighbors in reducing plastic waste.', goal: 1000, collected: 750, participants: 450, status: 'active', color: 'var(--primary)' },
    { id: 2, title: 'Downtown Clean-up', description: 'This Saturday, 10 AM. Help the community.', goal: 500, collected: 200, participants: 85, status: 'active', color: 'var(--warning)' }
  ]);
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: 'Rahul Sharma', role: 'Field Lead', hours: 24, campaign: 'Plastic-Free Week', status: 'active' },
    { id: 2, name: 'Priya Patel', role: 'Coordinator', hours: 18, campaign: 'Downtown Clean-up', status: 'active' },
    { id: 3, name: 'Amit Desai', role: 'Volunteer', hours: 12, campaign: 'Plastic-Free Week', status: 'active' },
    { id: 4, name: 'Sneha Kulkarni', role: 'Volunteer', hours: 8, campaign: 'Downtown Clean-up', status: 'inactive' }
  ]);
  const [fleetTrucks, setFleetTrucks] = useState([
    { id: 'TRK-01', zone: 'North', status: 'active', driver: 'Rajesh K.', capacity: 75 },
    { id: 'TRK-02', zone: 'South', status: 'active', driver: 'Suresh M.', capacity: 60 },
    { id: 'TRK-03', zone: 'East', status: 'maintenance', driver: 'Vikram P.', capacity: 0 },
    { id: 'TRK-04', zone: 'West', status: 'idle', driver: 'Deepak R.', capacity: 30 }
  ]);
  const ecoLevel = ecoPoints > 1500 ? "Zero Waste Master" : ecoPoints > 500 ? "Green Champion" : "Beginner";

  // Persist pickups & completedPickups to localStorage for cross-tab sync
  useEffect(() => { localStorage.setItem('ecosmart_pickups', JSON.stringify(pickups)); }, [pickups]);
  useEffect(() => { localStorage.setItem('ecosmart_completed', JSON.stringify(completedPickups)); }, [completedPickups]);

  // Listen for changes from other browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ecosmart_pickups' && e.newValue) {
        try { setPickups(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'ecosmart_completed' && e.newValue) {
        try { setCompletedPickups(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Handle back button / history pop
    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        // If no state, go to dashboard
        setActiveTab('dashboard');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Initial push state
    window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update history when activeTab changes (but not on popstate)
  const changeTab = (tabId) => {
    if (tabId !== activeTab) {
      window.history.pushState({ tab: tabId }, '', `#${tabId}`);
      setActiveTab(tabId);
    }
  };

  useEffect(() => {
    if (userProfile.role === 'Admin') {
      const id = setInterval(() => setAdminStats(p => p.map(s => ({ ...s, val: Math.max(10, Math.min(100, s.val + Math.floor(Math.random() * 11) - 5)) }))), 3000);
      return () => clearInterval(id);
    }
  }, [userProfile.role]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawName = formData.get('name') || formData.get('email').split('@')[0];
    const email = formData.get('email');
    const role = formData.get('role') || 'Citizen';
    
    try {
      const res = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rawName, email, role })
      });
      const userData = await res.json();
      setUserProfile(userData);
      setEcoPoints(userData.eco_points);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login failed:", err);
      // Fallback if backend is down
      setUserProfile({ id: 1, name: rawName, role, email, total_waste_kg: 0, total_co2_saved: 0, trees_saved: 0 });
      setIsLoggedIn(true);
    }
    changeTab('dashboard');
  };

  const roleNavLinks = {
    Citizen: [
      { id: 'dashboard', label: 'Home' }, 
      { id: 'scanning', label: 'Scan Waste' }, 
      { id: 'segregation', label: 'Learn & Segregate' }, 
      { id: 'rewards', label: 'Rewards' }, 
      { id: 'community', label: 'Impact' },
      { id: 'map', label: 'Locate' },
      { id: 'trucks', label: 'Trucks' },
      { id: 'chat', label: 'EcoBot AI' }
    ],
    Recycler: [{ id: 'dashboard', label: 'Overview' }, { id: 'pickups', label: 'Active Pickups' }, { id: 'earnings', label: 'Earnings' }, { id: 'chat', label: 'EcoBot AI' }],
    NGO: [{ id: 'dashboard', label: 'Overview' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'volunteers', label: 'Volunteers' }, { id: 'chat', label: 'EcoBot AI' }],
    Admin: [{ id: 'dashboard', label: 'Overview' }, { id: 'fleet', label: 'Fleet Management' }, { id: 'analytics', label: 'Analytics' }]
  };

  const navLinks = roleNavLinks[userProfile.role] || roleNavLinks['Citizen'];

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-box glass-panel animate-fade-in">
          <div className="auth-header"><div className="logo"><Leaf className="logo-icon" size={40} /><span>Eco<span className="text-gradient">Smart</span></span></div>
            <p>Authentication Service: Select your role to login</p></div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <><div className="input-group"><label>Full Name</label><input type="text" name="name" required /></div><div className="input-group"><label>Location</label><input type="text" name="location" placeholder="City or Zip" required /></div></>
            )}
            <div className="input-group">
              <label>User Role (Determines Dashboard System)</label>
              <select name="role" required style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}>
                <option value="Citizen">1. Citizen / Resident</option>
                <option value="Recycler">2. Recycler / Collector</option>
                <option value="NGO">3. NGO / Community Organizer</option>
                <option value="Admin">4. Municipality Admin</option>
              </select>
            </div>
            <div className="input-group"><label>Email Address</label><input type="email" name="email" required /></div>
            <div className="input-group"><label>Password</label><input type="password" name="password" required /></div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>{authMode === 'login' ? 'Login to Portal' : 'Register Account'}</button>
          </form>
          <div className="auth-toggle"><span onClick={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}</span></div>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (userProfile.role) {
      case 'Citizen':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
        if (activeTab === 'scanning') return <WasteScanning setActiveTab={changeTab} setEcoPoints={setEcoPoints} setNotifications={setNotifications} userProfile={userProfile} setUserProfile={setUserProfile} />;
        if (activeTab === 'segregation') return <WasteSegregation userProfile={userProfile} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'rewards') return <RewardsGamification userProfile={userProfile} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'community') return <CommunityImpact userProfile={userProfile} />;
        if (activeTab === 'map') return <MapLocator />;
        if (activeTab === 'trucks') return <TruckSchedule pickups={pickups} />;
        return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
      case 'Recycler':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} ecoPoints={ecoPoints} pickups={pickups} />;
        if (activeTab === 'pickups') return <RecyclerPickups setEcoPoints={setEcoPoints} pickups={pickups} setPickups={setPickups} setCompletedPickups={setCompletedPickups} setNotifications={setNotifications} />;
        if (activeTab === 'earnings') return <RecyclerEarnings ecoPoints={ecoPoints} completedPickups={completedPickups} />;
        return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} ecoPoints={ecoPoints} pickups={pickups} />;
      case 'NGO':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <NGODashboard setActiveTab={changeTab} campaigns={campaigns} volunteers={volunteers} />;
        if (activeTab === 'campaigns') return <NGOCampaigns campaigns={campaigns} setCampaigns={setCampaigns} />;
        if (activeTab === 'volunteers') return <NGOVolunteers volunteers={volunteers} setVolunteers={setVolunteers} campaigns={campaigns} />;
        return <NGODashboard setActiveTab={changeTab} campaigns={campaigns} volunteers={volunteers} />;
      case 'Admin':
        if (activeTab === 'dashboard') return <AdminDashboard adminStats={adminStats} setActiveTab={changeTab} />;
        if (activeTab === 'fleet') return <AdminFleet fleetTrucks={fleetTrucks} setFleetTrucks={setFleetTrucks} pickups={pickups} />;
        if (activeTab === 'analytics') return <AdminAnalytics adminStats={adminStats} pickups={pickups} completedPickups={completedPickups} fleetTrucks={fleetTrucks} />;
        return <AdminDashboard adminStats={adminStats} setActiveTab={changeTab} />;
      default: return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
    }
  };

  return (
    <div className="app-container">
      <header className="main-header glass-panel">
        <div className="logo animate-fade-in" onClick={() => changeTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Leaf className="logo-icon" size={32} /><span>Eco<span className="text-gradient">Smart</span></span>
        </div>

        <nav className="nav-links">
          {navLinks.map(link => (
            <div key={link.id} className={`nav-link ${activeTab === link.id ? 'active' : ''}`} onClick={() => changeTab(link.id)}>
              {link.label}
            </div>
          ))}
        </nav>

        <div className="user-profile">
          <div style={{ position: 'relative', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color={notifications.some(n => n.unread) ? 'var(--primary)' : 'var(--text-muted)'} />
            {notifications.some(n => n.unread) && <div style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%' }}></div>}
            {showNotifications && (
              <div className="glass-panel" style={{ position: 'absolute', top: '30px', right: '-50px', width: '300px', padding: '1rem', zIndex: 200, background: 'var(--bg-card)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)' }}>Notifications</h4><button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setNotifications(n => n.map(x => ({ ...x, unread: false })))}>Mark read</button>
                </div>
                {notifications.map(n => <div key={n.id} style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--glass-border)', padding: '0.75rem 0', color: n.unread ? 'var(--text-main)' : 'var(--text-muted)' }}><strong style={{ fontWeight: n.unread ? '700' : '500' }}>{n.text}</strong><br /><span style={{ color: 'var(--text-muted)' }}>{n.time}</span></div>)}
              </div>
            )}
          </div>

          {userProfile.role === 'Citizen' && (
            <div className="eco-wallet animate-float" title="Reward Points">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Coins size={18} /><span>{ecoPoints} Pts</span></div>
              <span className="eco-level" style={{ color: 'var(--primary)' }}>{ecoLevel}</span>
            </div>
          )}

          <div className="avatar" title={`${userProfile.name} (${userProfile.role})`}>{userProfile.name.charAt(0).toUpperCase()}</div>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}><LogOut size={20} /></button>
        </div>
      </header>

      <main className="main-content">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
