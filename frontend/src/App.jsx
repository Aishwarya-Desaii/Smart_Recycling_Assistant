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

const RewardsGamification = ({ userProfile, ecoPoints }) => {
  const [data, setData] = useState({ badges: [], recent_activity: [], leaderboard: [] });

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

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', backgroundImage: 'url(/eco_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}><Gift color="var(--primary)" /> Rewards & Gamification</h2>
        <img src="/eco_rewards.png" alt="Eco Rewards" style={{ height: '100px', width: 'auto', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Redeem Rewards</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <button className="btn-primary" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', justifyContent: 'space-between' }}><span>50% Transit Pass</span> <span style={{ color: 'var(--primary)' }}>-1000 Pts</span></button>
            <button className="btn-primary" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', justifyContent: 'space-between' }}><span>Eco-Friendly Grocery Kit</span> <span style={{ color: 'var(--primary)' }}>-2500 Pts</span></button>
          </div>
          
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
  const centers = [
    { name: "North Ave Recycling Hub", type: "All Plastics, E-Waste, Glass", dist: "1.2 km away", time: "Open until 7PM" },
    { name: "Downtown Eco Center", type: "Paper, Cardboard, Metals", dist: "3.5 km away", time: "Open 24/7" },
    { name: "Westside E-Waste Dropoff", type: "Batteries, Electronics Only", dist: "5.0 km away", time: "Open until 5PM" }
  ];
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Nearby Recycling Centers</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Find the nearest certified drop-off locations for specialized waste.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {centers.map((c, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{c.name}</h3>
                <span style={{ fontSize: '0.8rem', background: 'var(--glass-bg)', padding: '2px 8px', borderRadius: '12px' }}>{c.dist}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Accepts: {c.type}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{c.time}</span>
                <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Directions</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="map-container" style={{ position: 'relative', minHeight: '400px', background: 'url(https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map.svg) center/15% no-repeat, var(--glass-border)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '30%', left: '40%', color: 'var(--primary)' }}><MapPin size={32} /></div>
          <div style={{ position: 'absolute', top: '50%', left: '70%', color: 'var(--warning)' }}><MapPin size={32} /></div>
          <div style={{ position: 'absolute', top: '70%', left: '30%', color: 'var(--secondary)' }}><MapPin size={32} /></div>
          <button className="btn-primary" style={{ position: 'absolute', bottom: 20, right: 20 }}><Navigation size={18} /> Open Full Map</button>
        </div>
      </div>
    </div>
  );
};

const RecyclerDashboard = ({ userProfile, setActiveTab }) => (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    {/* Welcome Hero */}
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at left, rgba(139, 92, 246, 0.15), transparent), var(--glass-bg)' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Collector Route: <span className="text-gradient purple">{userProfile?.name || 'Driver'}</span> 🚛</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Shift started at 06:00 AM. You have <strong>12 active requests</strong> in your assigned zones today.</p>
    </div>

    {/* Primary Action: Active Pickups */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('pickups')} style={{ gridColumn: 'span 8', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="stat-icon purple" style={{ width: '80px', height: '80px', fontSize: '2.5rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}><Route size={40} /></div>
        <div className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary)', border: 'none' }}>Start Navigation <Navigation size={18} /></div>
      </div>
      <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Next: PK-101 (Bulk E-Waste)</h3>
      <p style={{ color: 'var(--text-muted)' }}>Sector 4, North Ave • 2.5 km away • Est. Time: 12 mins</p>
    </div>

    {/* Earnings Widget */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('earnings')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="stat-icon orange" style={{ width: '60px', height: '60px', marginBottom: '1rem', boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)' }}><Wallet size={30} /></div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 'bold' }}>Today's Est. Earnings</p>
      <h3 style={{ fontSize: '2.8rem', color: 'var(--warning)', fontWeight: 'bold' }}>$145<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>.00</span></h3>
    </div>
  </div>
);

const RecyclerPickups = () => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Active Pickups Queue</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><strong style={{ fontSize: '1.1rem' }}>PK-10{i} - Bulk E-Waste</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}><MapPin size={14} style={{ display: 'inline' }} /> Sector {i}, North Ave</p></div>
          <div style={{ display: 'flex', gap: '1rem' }}><button className="btn-primary" style={{ background: 'var(--secondary)' }}>Navigate</button><button className="btn-primary" style={{ background: 'var(--success)' }}>Complete</button></div>
        </div>
      ))}
    </div>
  </div>
);

const RecyclerEarnings = () => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}><h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Earnings</h2><div className="stat-card" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--warning)' }}><div className="stat-icon orange"><Wallet size={24} /></div><div><h4 style={{ color: 'var(--text-muted)' }}>Total Balance</h4><p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>$1,245.50</p></div></div></div>
);

const NGODashboard = ({ setActiveTab }) => (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    {/* Welcome Hero */}
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), var(--glass-bg)' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Community Impact Hub 🤝</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>Organize drives, manage volunteers, and track the real-world impact of your sustainability campaigns.</p>
    </div>

    {/* Primary Action: Active Campaign */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('campaigns')} style={{ gridColumn: 'span 7', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="stat-icon blue" style={{ width: '70px', height: '70px', boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}><Calendar size={35} /></div>
        <span style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>LIVE NOW</span>
      </div>
      <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Plastic-Free Week</h3>
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', margin: '1rem 0', overflow: 'hidden' }}>
        <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary)' }}></div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}><strong>750kg</strong> / 1000kg Goal Reached. 450 Citizens Active.</p>
    </div>

    {/* Volunteer CRM */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('volunteers')} style={{ gridColumn: 'span 5', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="stat-icon green" style={{ width: '60px', height: '60px', marginBottom: '1.5rem' }}><Users size={30} /></div>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Volunteer Network</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Manage assignments and verify hours.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>342</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>Active<br />Members</span>
      </div>
    </div>
  </div>
);

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

const AdminFleet = () => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}><h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Fleet Management</h2><div className="map-container" style={{ position: 'relative', height: '400px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}><Truck size={32} style={{ color: 'var(--primary)', position: 'absolute', top: '30%', left: '40%' }} /></div></div>
);



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userProfile, setUserProfile] = useState({ name: 'User', role: 'Citizen', location: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome to EcoSmart City Platform!", time: "Just now", unread: true }]);
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [adminStats, setAdminStats] = useState([{ zone: 'North', val: 45 }, { zone: 'South', val: 62 }, { zone: 'East', val: 30 }]);
  const ecoLevel = ecoPoints > 1500 ? "Zero Waste Master" : ecoPoints > 500 ? "Green Champion" : "Beginner";

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
        if (activeTab === 'dashboard') return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} userProfile={userProfile} />;
        if (activeTab === 'scanning') return <WasteScanning setActiveTab={changeTab} setEcoPoints={setEcoPoints} setNotifications={setNotifications} userProfile={userProfile} setUserProfile={setUserProfile} />;
        if (activeTab === 'segregation') return <WasteSegregation userProfile={userProfile} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'rewards') return <RewardsGamification userProfile={userProfile} ecoPoints={ecoPoints} />;
        if (activeTab === 'community') return <CommunityImpact userProfile={userProfile} />;
        if (activeTab === 'map') return <MapLocator />;
        return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} userProfile={userProfile} />;
      case 'Recycler':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} />;
        if (activeTab === 'pickups') return <RecyclerPickups />;
        if (activeTab === 'earnings') return <RecyclerEarnings />;
        return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} />;
      case 'NGO':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <NGODashboard setActiveTab={setActiveTab} />;
        if (activeTab === 'campaigns') return <div className="glass-panel" style={{ padding: '2rem' }}><h2>Campaigns</h2></div>;
        if (activeTab === 'volunteers') return <div className="glass-panel" style={{ padding: '2rem' }}><h2>Volunteers</h2></div>;
        return <NGODashboard setActiveTab={setActiveTab} />;
      case 'Admin':
        if (activeTab === 'dashboard' || activeTab === 'analytics') return <AdminDashboard adminStats={adminStats} setActiveTab={setActiveTab} />;
        if (activeTab === 'fleet') return <AdminFleet />;
        return <AdminDashboard adminStats={adminStats} setActiveTab={setActiveTab} />;
      default: return <CitizenDashboard setActiveTab={setActiveTab} ecoPoints={ecoPoints} userProfile={userProfile} />;
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
