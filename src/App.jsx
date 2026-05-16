import React, { useState, useEffect, useRef } from 'react';
import {
  Leaf, Coins, Award, Camera, Mic, Send, Zap, Activity, Users, Video, LogOut, MapPin,
  BarChart2, ShieldCheck, TreePine, Crosshair, BookOpen, Truck, Gift, Star, Clock,
  CheckCircle, Navigation, PlayCircle, Bell, Upload, MessageSquare, ClipboardList,
  Wallet, Route, Calendar, TrendingUp, Settings, Heart, AlertTriangle
} from 'lucide-react';
import './App.css';

// ==========================================
// SEPARATED UI COMPONENTS (To prevent React inline-component remount errors)
// ==========================================

const WasteScanning = ({ setActiveTab, setEcoPoints, setNotifications }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);

  const toggleCamera = async () => {
    if (isCameraActive) {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false); setScanStatus('idle');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraActive(true); setScanStatus('idle');
      } catch (err) { alert("Camera access denied"); }
    }
  };

  const simulateScan = (type) => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanResult({ category: type === 'upload' ? "Glass Bottle" : "Plastic (PET)", bin: "Blue Bin (Dry Waste)", recyclable: true, points: 50 });
      setScanStatus('result');
      if (videoRef.current) videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }, 2000);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Waste Scanner</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>FastAPI ML Integration: Instantly classify waste via Camera or Image Upload.</p>

      {scanStatus !== 'result' ? (
        <>
          <div className="scanner-frame" onClick={() => simulateScan('cam')} style={{ cursor: isCameraActive ? 'pointer' : 'default', width: '100%', maxWidth: '500px', height: '300px', background: '#000', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            {isCameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {scanStatus === 'scanning' ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>Analyzing Object...</div></div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center' }}><span style={{ background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: '20px' }}>Tap frame to capture</span></div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {scanStatus === 'scanning' ? <div style={{ color: 'var(--primary)' }}>Uploading & Analyzing...</div> : <><Camera size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} /><span>Camera / Preview Area</span></>}
              </div>
            )}
          </div>
          {scanStatus === 'idle' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={toggleCamera}><Video size={18} /> {isCameraActive ? 'Stop Camera' : 'Webcam Capture'}</button>
              <button className="btn-primary" onClick={() => simulateScan('upload')} style={{ background: 'var(--secondary)' }}><Upload size={18} /> Image Upload</button>
            </div>
          )}
        </>
      ) : (
        <div className="scan-card glass-panel blue" style={{ width: '100%', maxWidth: '500px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{scanResult.category} Detected</h3>
          <p style={{ marginBottom: '0.5rem' }}><strong>Disposal Guidance:</strong> {scanResult.bin}</p>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => {
            setEcoPoints(p => p + scanResult.points);
            setScanStatus('idle');
            setNotifications(n => [{ id: Date.now(), text: `Earned ${scanResult.points} Pts!`, time: "Just now", unread: true }, ...n]);
            setActiveTab('dashboard');
          }}><CheckCircle size={18} /> Confirm Disposal (+{scanResult.points} Pts)</button>
        </div>
      )}
    </div>
  );
};

const CitizenDashboard = ({ userProfile, setActiveTab, ecoPoints }) => {
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceText, setVoiceText] = useState('Tap to ask EcoBot...');

  const handleVoiceClick = () => {
    if (voiceState !== 'idle') return;
    setVoiceState('listening');
    setVoiceText('Listening for query...');

    setTimeout(() => {
      setVoiceState('speaking');
      setVoiceText('You can recycle e-waste at the North Ave center!');

      setTimeout(() => {
        setVoiceState('idle');
        setVoiceText('Tap to ask EcoBot...');
      }, 4000);
    }, 2500);
  };

  return (
    <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

      {/* Welcome Hero - Spans Full Width */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at right, rgba(16, 185, 129, 0.15), transparent), var(--glass-bg)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, <span className="text-gradient">{userProfile?.name || 'Eco Warrior'}</span>! 🌍</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>Your recycling efforts this week have saved approximately <strong>12kg of CO₂</strong>. You are currently in the top 15% of your city's leaderboard!</p>
      </div>

      {/* Primary Action: AI Scanner */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('scanning')} style={{ gridColumn: 'span 8', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="stat-icon green" style={{ width: '80px', height: '80px', fontSize: '2.5rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' }}><Camera size={40} /></div>
          <div className="btn-primary" style={{ padding: '0.75rem 1.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>Open Scanner <Zap size={18} /></div>
        </div>
        <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>AI Waste Scanner</h3>
        <p style={{ color: 'var(--text-muted)' }}>Use your device camera or upload an image to instantly classify waste, get disposal guidance, and earn points.</p>
      </div>

      {/* Wallet & Gamification */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('rewards')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(var(--primary) 70%, rgba(255,255,255,0.1) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={24} color="var(--warning)" style={{ marginBottom: '0.2rem' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{ecoPoints}</span>
          </div>
        </div>
        <h3 style={{ fontSize: '1.3rem', color: 'white' }}>Your EcoWallet</h3>
        <p style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Redeem Rewards ➔</p>
      </div>

      {/* Impact Tracker */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('community')} style={{ gridColumn: 'span 8', cursor: 'pointer', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> Impact Tracker</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Waste Recycled</p><h4 style={{ fontSize: '1.4rem' }}>45 kg</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>CO₂ Saved</p><h4 style={{ fontSize: '1.4rem' }}>12 kg</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Trees Saved</p><h4 style={{ fontSize: '1.4rem' }}>0.5</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Streak</p><h4 style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>5 Days 🔥</h4></div>
          </div>
        </div>
        <div className="stat-icon green" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}><TreePine size={40} /></div>
      </div>

      {/* Quick Action: Pickups */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('pickup')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="stat-icon purple"><Truck size={28} /></div>
        <div className="stat-info">
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Schedule Pickup</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Heavy or e-waste?</p>
        </div>
      </div>

      {/* AI Voice Assistant */}
      <div className="glass-panel stat-card" onClick={handleVoiceClick} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: voiceState === 'listening' ? 'rgba(239, 68, 68, 0.1)' : voiceState === 'speaking' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)', border: voiceState !== 'idle' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
        <div className="stat-icon" style={{ background: voiceState === 'idle' ? 'rgba(16, 185, 129, 0.2)' : voiceState === 'listening' ? 'var(--danger)' : 'var(--primary)', color: voiceState === 'idle' ? 'var(--primary)' : 'white', animation: voiceState === 'listening' ? 'pulse 1s infinite' : 'none' }}>
          {voiceState === 'speaking' ? <Activity size={24} /> : <Mic size={24} />}
        </div>
        <div className="stat-info">
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>AI Voice Assistant</h3>
          <p style={{ fontSize: '0.85rem', color: voiceState !== 'idle' ? 'white' : 'var(--text-muted)', fontWeight: voiceState !== 'idle' ? 'bold' : 'normal' }}>{voiceText}</p>
        </div>
      </div>

      {/* Recycling Centers */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('map')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="stat-icon orange"><MapPin size={28} /></div>
        <div className="stat-info">
          <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Recycling Centers</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Find nearby centers.</p>
        </div>
      </div>

    </div>
  );
};

const WasteSegregation = ({ setActiveTab, setEcoPoints }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><BookOpen color="var(--primary)" /> Waste Segregation & Info</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Segregation Guidelines</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--success)' }}></div> <strong>Wet Waste:</strong> Food scraps, organic matter.</li>
          <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--secondary)' }}></div> <strong>Dry Waste:</strong> Paper, clean plastic, glass.</li>
          <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--danger)' }}></div> <strong>Hazardous:</strong> Batteries, e-waste, chemicals.</li>
          <li style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--warning)' }}></div> <strong>Recyclable:</strong> Metals, clean cardboard.</li>
        </ul>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Awareness & Quizzes</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Take the daily quiz to improve your knowledge and earn bonus points!</p>
        <button className="btn-primary" onClick={() => { alert('Quiz Started! Correct Answer! +10 Pts'); setEcoPoints(p => p + 10); }} style={{ width: '100%', marginBottom: '1rem' }}><Award size={18} /> Start Daily Quiz (+10 Pts)</button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>
          <PlayCircle size={16} /> <span>Watch: How to compost at home</span>
        </div>
      </div>
    </div>
  </div>
);

const CommunityImpact = ({ userProfile }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Users color="var(--primary)" /> Community & Impact</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Your Impact Tracker</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Waste Recycled:</span> <strong>45 kg</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CO₂ Saved:</span> <strong>12 kg</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Trees Saved:</span> <strong>0.5</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Current Streak:</span> <strong style={{ color: 'var(--warning)' }}>5 Days 🔥</strong></div>
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--primary)' }}><Send size={16} /> Share on Social Media</button>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Local Events & Challenges</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Plastic-Free Week</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Join 450 neighbors in reducing plastic waste.</p>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Join Challenge</button>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.3rem' }}>Downtown Clean-up</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This Saturday, 10 AM. Earn 200 Pts.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RewardsGamification = ({ userProfile, ecoPoints }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Gift color="var(--primary)" /> Rewards & Gamification</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Redeem Rewards</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', justifyContent: 'space-between' }}><span>50% Transit Pass</span> <span style={{ color: 'var(--primary)' }}>-1000 Pts</span></button>
          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', justifyContent: 'space-between' }}><span>Eco-Friendly Grocery Kit</span> <span style={{ color: 'var(--primary)' }}>-2500 Pts</span></button>
        </div>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Badges & Achievements</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }} title="Green Champion"><Award size={30} /></div>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }} title="Plastic Warrior"><ShieldCheck size={30} /></div>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', border: '2px solid var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }} title="Zero Waste Master"><Star size={30} /></div>
        </div>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award /> Leaderboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[{ rank: 1, name: 'Sarah M.', pts: 4500 }, { rank: 2, name: 'Raj K.', pts: 3200 }, { rank: 42, name: userProfile.name + ' (You)', pts: ecoPoints, highlight: true }].map(u => (
            <div key={u.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: u.highlight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: u.highlight ? '1px solid var(--primary)' : 'none' }}>
              <span style={{ fontWeight: 'bold' }}>#{u.rank} &nbsp; {u.name}</span><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{u.pts} Pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MapLocator = () => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Recycling Centers Map</h2>
    <div className="map-container" style={{ position: 'relative', height: '500px', background: 'url(https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map.svg) center/10% no-repeat, rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MapPin size={48} style={{ color: 'var(--danger)', animation: 'pulse 2s infinite' }} />
    </div>
  </div>
);

const PickupScheduling = ({ setActiveTab, setNotifications }) => {
  const [step, setStep] = useState('request'); // request, tracking, rating

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Truck color="var(--primary)" /> Recycling Pickup Scheduling</h2>
      
      {step === 'request' && (
        <div style={{ maxWidth: '500px' }}>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Waste Type</label><select><option>Bulk E-Waste</option><option>Mixed Recyclables</option><option>Furniture</option></select></div>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Schedule Date & Time</label><input type="datetime-local" /></div>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Additional Details / Images</label><input type="text" placeholder="e.g., Heavy items, call upon arrival" /></div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => {
            setNotifications(n => [{ id: Date.now(), text: "System assigned nearest collector: John D.", time: "Just now", unread: true }, ...n]);
            setStep('tracking');
          }}>Request Pickup</button>
        </div>
      )}

      {step === 'tracking' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--success)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Pickup Confirmed & Tracking</h3>
            <p style={{ marginBottom: '1rem' }}>Collector <strong>John D.</strong> is on the way.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '15px', height: '15px', background: 'var(--success)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
              <span>Live Status: 5 mins away</span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setStep('rating')}>Simulate Completion</button>
        </div>
      )}

      {step === 'rating' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Rate the Service</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>How was your pickup experience?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map(star => <Star key={star} size={32} color="var(--warning)" style={{ cursor: 'pointer' }} />)}
          </div>
          <button className="btn-primary" onClick={() => {
            setNotifications(n => [{ id: Date.now(), text: "Earned 50 points for pickup feedback!", time: "Just now", unread: true }, ...n]);
            setActiveTab('dashboard');
          }}>Submit Feedback</button>
        </div>
      )}
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
      <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>Next: PK-101 (Bulk E-Waste)</h3>
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
        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.5rem' }}>Plastic-Free Week</h3>
      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '1rem 0', overflow: 'hidden' }}>
        <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary)' }}></div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}><strong>750kg</strong> / 1000kg Goal Reached. 450 Citizens Active.</p>
    </div>

    {/* Volunteer CRM */}
    <div className="glass-panel stat-card" onClick={() => setActiveTab('volunteers')} style={{ gridColumn: 'span 5', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="stat-icon green" style={{ width: '60px', height: '60px', marginBottom: '1.5rem' }}><Users size={30} /></div>
        <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>Volunteer Network</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Manage assignments and verify hours.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
      <h3 style={{ fontSize: '2.5rem', color: 'white' }}>1,245 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Tons</span></h3>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('fleet')} style={{ gridColumn: 'span 4', cursor: 'pointer', borderTop: '4px solid var(--secondary)', padding: '1.5rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>ACTIVE FLEET</p>
      <h3 style={{ fontSize: '2.5rem', color: 'white' }}>42 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Trucks Deployed</span></h3>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('analytics')} style={{ gridColumn: 'span 4', cursor: 'pointer', borderTop: '4px solid var(--warning)', padding: '1.5rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>CITIZEN ENGAGEMENT</p>
      <h3 style={{ fontSize: '2.5rem', color: 'white' }}>8.4k <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Active Users</span></h3>
    </div>

    {/* Live Chart */}
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'rgba(20, 20, 25, 0.95)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <h3 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><Activity size={20} color="var(--primary)" /> Real-Time Zone Activity (Live Flow)</h3>
      <div className="bar-chart" style={{ height: '250px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '30px' }}>
        {/* Grid lines */}
        <div style={{ position: 'absolute', top: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
        {adminStats.map(stat => (
          <div key={stat.zone} className="bar animate-float" style={{ width: '60px', height: `${stat.val}%`, background: `linear-gradient(to top, rgba(16, 185, 129, 0.2), var(--primary))`, borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 -5px 20px rgba(16, 185, 129, 0.2)' }}>
            <span style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{stat.val}</span>
            <span style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{stat.zone}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminFleet = () => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}><h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Fleet Management</h2><div className="map-container" style={{ position: 'relative', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}><Truck size={32} style={{ color: 'var(--primary)', position: 'absolute', top: '30%', left: '40%' }} /></div></div>
);


const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm EcoBot, your Smart City AI Assistant. You can speak or type your question below." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = (overrideText = null) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Based on city guidelines, you should put that in the Blue Bin for dry waste.",
        "E-waste dropoff is scheduled for every second Saturday of the month at Sector 4.",
        "You can earn 50 EcoPoints by dropping off 10 plastic bottles at the nearest Smart Bin.",
        "Composting wet waste at home can reduce your carbon footprint by 15 percent."
      ];

      let reply = responses[Math.floor(Math.random() * responses.length)];
      if (textToSend.toLowerCase().includes("battery") || textToSend.toLowerCase().includes("batteries")) {
        reply = "Old batteries are considered hazardous waste. Please take them to the electronic waste facility at Sector 4.";
      } else if (textToSend.toLowerCase().includes("plastic")) {
        reply = "Please rinse plastic containers and place them in the Blue Dry Waste bin.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
      speakText(reply);
    }, 1500);
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0' }}>EcoBot AI</h2>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>● Voice Module Active</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <Users size={16} /> : <Leaf size={16} />}
            </div>
            <div style={{ background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: msg.role === 'user' ? '16px 0 16px 16px' : '0 16px 16px 16px', color: 'white', lineHeight: '1.5', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={16} /></div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0 16px 16px 16px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both' }}></div>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', alignItems: 'center' }}>
        <button onClick={handleMicClick} style={{ background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.05)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', animation: isListening ? 'pulse 1s infinite' : 'none', transition: 'all 0.3s' }}>
          <Mic size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? "Listening..." : "Ask EcoBot anything..."}
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '25px', color: 'white', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: 'var(--primary)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
// ==========================================
// MAIN APP COMPONENT
// ==========================================
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
    if (userProfile.role === 'Admin') {
      const id = setInterval(() => setAdminStats(p => p.map(s => ({ ...s, val: Math.max(10, Math.min(100, s.val + Math.floor(Math.random() * 11) - 5)) }))), 3000);
      return () => clearInterval(id);
    }
  }, [userProfile.role]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') || formData.get('email').split('@')[0];
    const role = formData.get('role') || 'Citizen';
    setUserProfile({ name, role, location: formData.get('location') || 'City Center' });
    setActiveTab('dashboard');
    setIsLoggedIn(true);
  };

  const roleNavLinks = {
    Citizen: [
      { id: 'dashboard', label: 'Home' }, 
      { id: 'scanning', label: 'Scan Waste' }, 
      { id: 'segregation', label: 'Learn & Segregate' }, 
      { id: 'rewards', label: 'Rewards' }, 
      { id: 'pickup', label: 'Pickups' },
      { id: 'community', label: 'Impact' },
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
              <select name="role" required style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}>
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
        if (activeTab === 'dashboard') return <CitizenDashboard setActiveTab={setActiveTab} ecoPoints={ecoPoints} userProfile={userProfile} />;
        if (activeTab === 'scanning') return <WasteScanning setActiveTab={setActiveTab} setEcoPoints={setEcoPoints} setNotifications={setNotifications} />;
        if (activeTab === 'segregation') return <WasteSegregation setActiveTab={setActiveTab} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'rewards') return <RewardsGamification userProfile={userProfile} ecoPoints={ecoPoints} />;
        if (activeTab === 'pickup') return <PickupScheduling setActiveTab={setActiveTab} setNotifications={setNotifications} />;
        if (activeTab === 'community') return <CommunityImpact userProfile={userProfile} />;
        if (activeTab === 'map') return <MapLocator />;
        return <CitizenDashboard setActiveTab={setActiveTab} ecoPoints={ecoPoints} userProfile={userProfile} />;
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
        <div className="logo animate-fade-in" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Leaf className="logo-icon" size={32} /><span>Eco<span className="text-gradient">Smart</span></span>
        </div>

        <nav className="nav-links">
          {navLinks.map(link => (
            <div key={link.id} className={`nav-link ${activeTab === link.id ? 'active' : ''}`} onClick={() => setActiveTab(link.id)}>
              {link.label}
            </div>
          ))}
        </nav>

        <div className="user-profile">
          <div style={{ position: 'relative', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color={notifications.some(n => n.unread) ? 'var(--primary)' : 'var(--text-muted)'} />
            {notifications.some(n => n.unread) && <div style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%' }}></div>}
            {showNotifications && (
              <div className="glass-panel" style={{ position: 'absolute', top: '30px', right: '-50px', width: '300px', padding: '1rem', zIndex: 200, background: 'rgba(20,20,25,0.95)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4>Notifications</h4><button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setNotifications(n => n.map(x => ({ ...x, unread: false })))}>Mark read</button>
                </div>
                {notifications.map(n => <div key={n.id} style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 0', color: n.unread ? 'white' : 'var(--text-muted)' }}><strong>{n.text}</strong><br /><span>{n.time}</span></div>)}
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
