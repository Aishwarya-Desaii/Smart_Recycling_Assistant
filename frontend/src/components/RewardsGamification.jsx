import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Star, Gift } from 'lucide-react';

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

  const IconMap = { Award: <Award size={30} />, ShieldCheck: <ShieldCheck size={30} />, Star: <Star size={30} /> };

  const coupons = [
    { id: 1, label: 'Electricity Bill', cost: 100, discount: 5, color: 'var(--warning)' },
    { id: 2, label: 'Water Bill', cost: 200, discount: 10, color: 'rgb(59, 130, 246)' },
    { id: 3, label: 'Gas Bill', cost: 500, discount: 25, color: 'var(--secondary)' },
    { id: 4, label: 'Property Tax', cost: 1000, discount: 50, color: 'var(--primary)' },
  ];

  const handleRedeem = async (coupon) => {
    if (ecoPoints < coupon.cost) return;
    const code = `ECO-${coupon.label.split(' ')[0].toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    try {
      const res = await fetch(`http://localhost:8000/users/${userProfile?.id}/redeem`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points_to_redeem: coupon.cost, coupon_type: coupon.label })
      });
      const data = await res.json();
      if (data.success) { setEcoPoints(data.eco_points); setRedeemed({ ...coupon, code }); }
      else { alert(data.detail || 'Redemption failed'); }
    } catch { setEcoPoints(prev => prev - coupon.cost); setRedeemed({ ...coupon, code }); }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', backgroundImage: 'url(/eco_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}><Gift color="var(--primary)" /> Rewards & Gamification</h2>
        <div style={{ textAlign: 'right' }}><span style={{ padding: '0.4rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>100 pts = ₹5 | Balance: {ecoPoints} pts</span></div>
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
              {coupons.map(c => { const canAfford = ecoPoints >= c.cost; return (
                <button key={c.id} className="btn-primary" onClick={() => canAfford && handleRedeem(c)} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', justifyContent: 'space-between', opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed', borderLeft: `4px solid ${c.color}` }}>
                  <span>{c.label} (₹{c.discount} OFF)</span><span style={{ color: canAfford ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 'bold' }}>-{c.cost} Pts</span>
                </button>); })}
            </div>
          )}
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Badges & Achievements</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {data.badges.length > 0 ? data.badges.map(b => (
              <div key={b.id} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${b.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.color }} title={b.name}>{IconMap[b.icon]}</div>
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

export default RewardsGamification;
