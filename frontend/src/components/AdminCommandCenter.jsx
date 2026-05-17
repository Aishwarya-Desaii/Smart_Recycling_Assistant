import React from 'react';
import { ShieldCheck, Truck, MapPin, CheckCircle, Activity, Zap } from 'lucide-react';

const AdminCommandCenter = ({ adminStats, setActiveTab, fleetTrucks, pickups, completedPickups }) => {
  const activeTrucks = fleetTrucks ? fleetTrucks.filter(t => t.status === 'active').length : 0;
  const idleTrucks = fleetTrucks ? fleetTrucks.filter(t => t.status === 'idle').length : 0;
  const maintenanceTrucks = fleetTrucks ? fleetTrucks.filter(t => t.status === 'maintenance').length : 0;
  const totalCompleted = completedPickups ? completedPickups.length : 0;
  const pendingPickups = pickups ? pickups.length : 0;
  const avgCapacity = fleetTrucks ? Math.round(fleetTrucks.reduce((s, t) => s + t.capacity, 0) / fleetTrucks.length) : 0;

  return (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.1), transparent), var(--glass-bg)' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><ShieldCheck color="var(--primary)" size={35} /> Command Center</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>Managing <strong>{fleetTrucks ? fleetTrucks.length : 0} trucks</strong> across the city. <strong>{pendingPickups} pickups pending</strong>, <strong>{totalCompleted} completed today</strong>.</p>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('fleet')} style={{ gridColumn: 'span 3', cursor: 'pointer', borderTop: '4px solid var(--success)', padding: '1.5rem', textAlign: 'center' }}><Truck size={28} color="var(--success)" style={{ marginBottom: '0.5rem' }} /><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>ACTIVE TRUCKS</p><h3 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{activeTrucks}</h3></div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('fleet')} style={{ gridColumn: 'span 3', cursor: 'pointer', borderTop: '4px solid var(--warning)', padding: '1.5rem', textAlign: 'center' }}><Truck size={28} color="var(--warning)" style={{ marginBottom: '0.5rem' }} /><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>IDLE / MAINTENANCE</p><h3 style={{ fontSize: '2.5rem', color: 'var(--warning)' }}>{idleTrucks + maintenanceTrucks}</h3></div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('analytics')} style={{ gridColumn: 'span 3', cursor: 'pointer', borderTop: '4px solid var(--primary)', padding: '1.5rem', textAlign: 'center' }}><MapPin size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} /><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>PENDING PICKUPS</p><h3 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{pendingPickups}</h3></div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('analytics')} style={{ gridColumn: 'span 3', cursor: 'pointer', borderTop: '4px solid rgb(139, 92, 246)', padding: '1.5rem', textAlign: 'center' }}><CheckCircle size={28} color="rgb(139, 92, 246)" style={{ marginBottom: '0.5rem' }} /><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>COMPLETED TODAY</p><h3 style={{ fontSize: '2.5rem', color: 'rgb(139, 92, 246)' }}>{totalCompleted}</h3></div>
    <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={20} color="var(--warning)" /> Quick Actions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button className="btn-primary" onClick={() => setActiveTab('fleet')} style={{ justifyContent: 'flex-start', gap: '0.5rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}><Truck size={18} /> Manage Fleet</button>
        <button className="btn-primary" onClick={() => setActiveTab('analytics')} style={{ justifyContent: 'flex-start', gap: '0.5rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}><Activity size={18} /> View Analytics</button>
      </div>
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>AVG FLEET CAPACITY</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ flex: 1, height: '10px', background: 'var(--bg-surface)', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: `${avgCapacity}%`, height: '100%', background: avgCapacity > 80 ? 'var(--danger)' : avgCapacity > 50 ? 'var(--warning)' : 'var(--success)', borderRadius: '5px', transition: 'width 0.5s ease' }}></div></div><span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{avgCapacity}%</span></div>
      </div>
    </div>
    <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '2.5rem', background: 'rgba(20, 20, 25, 0.95)', border: '1px solid var(--glass-border)' }}>
      <h3 style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}><Activity size={20} color="var(--primary)" /> Real-Time Zone Activity</h3>
      <div className="bar-chart" style={{ height: '200px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1rem', paddingBottom: '30px' }}>
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
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} color="var(--success)" /> Recent Completed Pickups</h3>
      {completedPickups && completedPickups.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {completedPickups.slice(0, 6).map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '10px', borderLeft: '3px solid var(--success)' }}>
              <div><strong style={{ color: 'var(--text-main)' }}>{p.id}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.type} • {p.address?.split(',')[0]}</p></div>
              <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Done</span>
            </div>
          ))}
        </div>
      ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No completed pickups yet. Pickups completed by recyclers will appear here.</p>}
    </div>
  </div>
  );
};

export default AdminCommandCenter;
