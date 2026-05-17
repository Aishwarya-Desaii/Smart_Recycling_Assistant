import React from 'react';
import { MapPin, Navigation, Calendar, Truck } from 'lucide-react';

const TruckSchedule = ({ pickups }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck color="var(--primary)" /> Mobile Collection Trucks</h2>
    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Find the scheduled mobile pickup trucks in your area today. Go to these locations to throw your trash directly into the collection vehicle.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      {pickups.map((truck) => (
        <div key={truck.id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>{truck.id}</h3>
            <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Active Today</span>
          </div>
          <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} color="var(--primary)" /> {truck.address}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Accepts: {truck.type}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {truck.time || 'Ongoing'}</span>
            <button className="btn-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address)}`, '_blank')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}><Navigation size={14} style={{ display: 'inline', marginRight: '0.2rem' }} /> Go Here</button>
          </div>
        </div>
      ))}
      {pickups.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No trucks currently scheduled.</p>}
    </div>
  </div>
);

export default TruckSchedule;
