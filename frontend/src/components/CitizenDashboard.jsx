import React, { useState } from 'react';
import { Coins, Camera, Mic, Zap, Activity, MapPin, TreePine, Truck } from 'lucide-react';

const CitizenDashboard = ({ userProfile, setActiveTab, ecoPoints }) => {
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceText, setVoiceText] = useState('Tap to ask EcoBot...');
  const handleVoiceClick = (e) => {
    e.stopPropagation(); // Prevent tab switch if they click the mic icon specifically
    if (voiceState !== 'idle') return;
    setVoiceState('listening');
    setVoiceText('Listening for query...');

    setTimeout(() => {
      setVoiceState('speaking');
      setVoiceText('You can recycle e-waste at the North Ave center!');

      setTimeout(() => {
        setVoiceState('idle');
        setVoiceText('Tap mic to test voice, or click card to open Chat.');
      }, 4000);
    }, 2500);
  };

  return (
    <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

      {/* Welcome Hero - Spans Full Width */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 100%), url(/eco_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--glass-border-light)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Welcome back, <span className="text-gradient">{userProfile?.name || 'Eco Warrior'}</span>! 🌍</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', fontWeight: '500' }}>Your recycling efforts have saved approximately <strong style={{color: 'var(--primary)'}}>{userProfile?.total_co2_saved ? userProfile.total_co2_saved.toFixed(2) : 0}kg of CO₂</strong>. You are currently in the top 15% of your city's leaderboard!</p>
      </div>

      {/* Primary Action: AI Scanner */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('scanning')} style={{ gridColumn: 'span 8', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(132, 204, 22, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="stat-icon green" style={{ width: '80px', height: '80px', fontSize: '2.5rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><Camera size={40} /></div>
          <div className="btn-primary" style={{ padding: '0.75rem 1.5rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>Open Scanner <Zap size={18} /></div>
        </div>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>AI Waste Scanner</h3>
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
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>Your EcoWallet</h3>
        <p style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Redeem Rewards ➔</p>
      </div>

      {/* Impact Tracker */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('community')} style={{ gridColumn: 'span 8', cursor: 'pointer', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> Impact Tracker</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Waste Recycled</p><h4 style={{ fontSize: '1.4rem' }}>{userProfile?.total_waste_kg ? userProfile.total_waste_kg.toFixed(2) : 0} kg</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>CO₂ Saved</p><h4 style={{ fontSize: '1.4rem' }}>{userProfile?.total_co2_saved ? userProfile.total_co2_saved.toFixed(2) : 0} kg</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Trees Saved</p><h4 style={{ fontSize: '1.4rem' }}>{userProfile?.trees_saved ? userProfile.trees_saved.toFixed(2) : 0}</h4></div>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Streak</p><h4 style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>5 Days 🔥</h4></div>
          </div>
        </div>
        <div className="stat-icon green" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}><TreePine size={40} /></div>
      </div>

      {/* Recycling Centers */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('map')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="stat-icon orange"><MapPin size={28} /></div>
        <div className="stat-info">
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Recycling Centers</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Find nearby centers.</p>
        </div>
      </div>

      {/* Mobile Truck Pickups */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('trucks')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="stat-icon green"><Truck size={28} /></div>
        <div className="stat-info">
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Truck Schedule</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Find mobile drop-offs.</p>
        </div>
      </div>

      {/* AI Voice Assistant */}
      <div className="glass-panel stat-card" onClick={() => setActiveTab('chat')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: voiceState === 'listening' ? 'rgba(239, 68, 68, 0.1)' : voiceState === 'speaking' ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)', border: voiceState !== 'idle' ? '1px solid var(--primary)' : '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}>
        <div className="stat-icon" onClick={handleVoiceClick} style={{ background: voiceState === 'idle' ? 'rgba(16, 185, 129, 0.2)' : voiceState === 'listening' ? 'var(--danger)' : 'var(--primary)', color: voiceState === 'idle' ? 'var(--primary)' : 'white', animation: voiceState === 'listening' ? 'pulse 1s infinite' : 'none' }}>
          {voiceState === 'speaking' ? <Activity size={24} /> : <Mic size={24} />}
        </div>
        <div className="stat-info">
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>AI Assistant</h3>
          <p style={{ fontSize: '0.85rem', color: voiceState !== 'idle' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: voiceState !== 'idle' ? 'bold' : 'normal' }}>{voiceText}</p>
        </div>
      </div>

    </div>
  );
};

export default CitizenDashboard;
