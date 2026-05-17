import React from 'react';
import { Wallet, MapPin } from 'lucide-react';

const RecyclerEarnings = ({ ecoPoints, completedPickups }) => {
  const todayStr = new Date().toDateString();
  const todayEarnings = completedPickups.filter(p => new Date(p.completedAt).toDateString() === todayStr).reduce((sum, p) => sum + p.points, 0);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet color="var(--warning)" /> Earnings Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--warning)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Balance</p><h3 style={{ fontSize: '2.5rem', color: 'var(--warning)', fontWeight: 'bold' }}>₹{ecoPoints}</h3></div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Today's Earnings</p><h3 style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 'bold' }}>₹{todayEarnings}</h3></div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.5)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Pickups Done</p><h3 style={{ fontSize: '2.5rem', color: 'rgb(139, 92, 246)', fontWeight: 'bold' }}>{completedPickups.length}</h3></div>
      </div>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Transaction History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
        {completedPickups.length > 0 ? completedPickups.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div><strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {p.address}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.completedAt).toLocaleString()}</p></div>
            <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>+₹{p.points}</span>
          </div>
        )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No completed pickups yet. Complete pickups to see earnings here.</p>}
      </div>
      {ecoPoints > 0 && (
        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--warning)', fontSize: '1rem', padding: '0.9rem' }} onClick={() => alert(`Withdrawal of ₹${ecoPoints} initiated! Funds will be transferred within 24 hours.`)}><Wallet size={18} /> Withdraw ₹{ecoPoints} to Bank</button>
      )}
    </div>
  );
};

export default RecyclerEarnings;
