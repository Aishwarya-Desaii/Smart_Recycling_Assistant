import React from 'react';
import { Activity, CheckCircle } from 'lucide-react';

const AdminAnalytics = ({ adminStats, pickups, completedPickups, fleetTrucks }) => {
  const totalRecycled = completedPickups.reduce((s, p) => s + p.points, 0);
  const activeTrucks = fleetTrucks.filter(t => t.status === 'active').length;

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity color="var(--primary)" /> City Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Total Recycled Points</p><h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{totalRecycled}</h3></div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--secondary)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Active Fleet</p><h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{activeTrucks} / {fleetTrucks.length}</h3></div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--warning)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Pending Pickups</p><h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{pickups.length}</h3></div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--success)', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Completed Today</p><h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>{completedPickups.length}</h3></div>
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
            <div><strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.completedAt).toLocaleString()}</p></div>
            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Done</span>
          </div>
        )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No completed pickups to display.</p>}
      </div>
    </div>
  );
};

export default AdminAnalytics;
