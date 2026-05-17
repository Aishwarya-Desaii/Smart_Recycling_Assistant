import React from 'react';
import { Route, Navigation, Wallet, MapPin } from 'lucide-react';

const RecyclerDashboard = ({ userProfile, setActiveTab, ecoPoints, pickups }) => (
  <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
    <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at left, rgba(139, 92, 246, 0.15), transparent), var(--glass-bg)' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Collector Route: <span className="text-gradient purple">{userProfile?.name || 'Driver'}</span> 🚛</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Shift started at 06:00 AM. You have <strong>{pickups.length} active requests</strong> in your assigned zones today.</p>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('pickups')} style={{ gridColumn: 'span 8', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="stat-icon purple" style={{ width: '80px', height: '80px', fontSize: '2.5rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}><Route size={40} /></div>
        <div className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary)', border: 'none' }}>Start Navigation <Navigation size={18} /></div>
      </div>
      <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Next: {pickups.length > 0 ? `${pickups[0].id} (${pickups[0].type})` : 'No upcoming pickups'}</h3>
      <p style={{ color: 'var(--text-muted)' }}>{pickups.length > 0 ? pickups[0].address : 'You have completed all pickups for today.'}</p>
    </div>
    <div className="glass-panel stat-card" onClick={() => setActiveTab('earnings')} style={{ gridColumn: 'span 4', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="stat-icon orange" style={{ width: '60px', height: '60px', marginBottom: '1rem', boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)' }}><Wallet size={30} /></div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 'bold' }}>Today's Est. Earnings</p>
      <h3 style={{ fontSize: '2.8rem', color: 'var(--warning)', fontWeight: 'bold' }}>₹{ecoPoints}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>.00</span></h3>
    </div>
  </div>
);

export default RecyclerDashboard;
