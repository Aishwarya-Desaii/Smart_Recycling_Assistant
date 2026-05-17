import React from 'react';
import { Truck, MapPin } from 'lucide-react';

const AdminFleet = ({ fleetTrucks, setFleetTrucks, pickups }) => {
  const toggleTruckStatus = (id) => { setFleetTrucks(fleetTrucks.map(t => { if (t.id === id) { const next = t.status === 'active' ? 'idle' : t.status === 'idle' ? 'maintenance' : 'active'; return { ...t, status: next, capacity: next === 'maintenance' ? 0 : next === 'idle' ? 30 : 75 }; } return t; })); };
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}><h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={20} /> {t.id}</h3><span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 'bold', background: `${statusColor(t.status)}22`, color: statusColor(t.status) }}>{t.status.toUpperCase()}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Zone:</span><strong>{t.zone}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Driver:</span><strong>{t.driver}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Capacity:</span><strong>{t.capacity}%</strong></div></div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}><div style={{ width: `${t.capacity}%`, height: '100%', background: t.capacity > 80 ? 'var(--danger)' : t.capacity > 50 ? 'var(--warning)' : 'var(--success)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div></div>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', background: statusColor(t.status) }} onClick={() => toggleTruckStatus(t.id)}>Cycle Status → {t.status === 'active' ? 'Idle' : t.status === 'idle' ? 'Maintenance' : 'Active'}</button>
          </div>
        ))}
      </div>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Current Pickup Assignments</h3>
      {pickups.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {pickups.map(p => (<div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}><div><strong style={{ color: 'var(--text-main)' }}>{p.id} — {p.type}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {p.address}</p></div><span style={{ color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.9rem' }}>{p.time}</span></div>))}
        </div>
      ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>All pickups have been completed.</p>}
    </div>
  );
};

export default AdminFleet;
