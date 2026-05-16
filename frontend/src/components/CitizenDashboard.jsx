import React, { useState } from 'react';
import { Coins, Camera, Mic, Zap, Activity, MapPin, TreePine, Truck, Gift, ShoppingBag, Coffee, Fuel } from 'lucide-react';

const CitizenDashboard = ({ userProfile, setActiveTab, ecoPoints, setEcoPoints }) => {
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
      {/* Redeem Rewards — 100 pts = ₹5 */}
      <RedeemRewards ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} />

    </div>
  );
};

const RedeemRewards = ({ ecoPoints, setEcoPoints }) => {
  const [redeemed, setRedeemed] = useState(null);
  const rate = 5; // ₹5 per 100 points
  const maxDiscount = Math.floor(ecoPoints / 100) * rate;

  const coupons = [
    { id: 1, label: 'Grocery Discount', icon: <ShoppingBag size={24} />, cost: 100, discount: 5, color: 'var(--primary)' },
    { id: 2, label: 'Coffee Voucher', icon: <Coffee size={24} />, cost: 200, discount: 10, color: 'var(--warning)' },
    { id: 3, label: 'Fuel Cashback', icon: <Fuel size={24} />, cost: 500, discount: 25, color: 'var(--secondary)' },
    { id: 4, label: 'Mega Discount', icon: <Gift size={24} />, cost: 1000, discount: 50, color: 'rgb(139, 92, 246)' },
  ];

  const handleRedeem = (coupon) => {
    if (ecoPoints < coupon.cost) return;
    setEcoPoints(prev => prev - coupon.cost);
    const code = `ECO-${coupon.label.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRedeemed({ ...coupon, code });
  };

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(139, 92, 246, 0.05))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Gift color="var(--primary)" /> Redeem Rewards</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>100 pts = ₹5</span>
          <span style={{ padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>Max: ₹{maxDiscount}</span>
        </div>
      </div>

      {redeemed ? (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '2px dashed var(--success)' }}>
          <Gift size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.4rem' }}>🎉 Coupon Redeemed!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{redeemed.label} — ₹{redeemed.discount} OFF</p>
          <div style={{ padding: '1rem 2rem', background: 'var(--bg-card)', borderRadius: '12px', display: 'inline-block', border: '2px dashed var(--primary)', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Your Coupon Code</p>
            <h2 style={{ color: 'var(--primary)', letterSpacing: '3px', fontSize: '1.8rem', margin: 0 }}>{redeemed.code}</h2>
          </div>
          <br />
          <button className="btn-primary" style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }} onClick={() => { navigator.clipboard.writeText(redeemed.code); alert('Coupon code copied!'); }}>Copy Code</button>
          <button className="btn-primary" style={{ marginTop: '1rem', marginLeft: '0.5rem', padding: '0.6rem 1.5rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={() => setRedeemed(null)}>Redeem Another</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {coupons.map(c => {
            const canAfford = ecoPoints >= c.cost;
            return (
              <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: `1px solid ${canAfford ? c.color : 'var(--border-color)'}`, opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => canAfford && handleRedeem(c)} onMouseEnter={e => { if (canAfford) e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${c.color}22`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>{c.icon}</div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.3rem' }}>{c.label}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: c.color, margin: '0.5rem 0' }}>₹{c.discount} OFF</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>{c.cost} points</p>
                <div style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: canAfford ? c.color : 'var(--bg-card)', color: canAfford ? 'white' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {canAfford ? 'Redeem Now' : 'Not Enough Pts'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
