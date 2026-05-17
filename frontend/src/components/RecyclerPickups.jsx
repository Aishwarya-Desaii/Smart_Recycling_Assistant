import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';

const RecyclerPickups = ({ setEcoPoints, pickups, setPickups, setCompletedPickups, setNotifications }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoute, setNewRoute] = useState({ type: '', address: '' });

  const handleNavigate = (address) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');

  const handleComplete = (id, points) => {
    const completed = pickups.find(p => p.id === id);
    setPickups(pickups.filter(p => p.id !== id));
    if (completed && setCompletedPickups) setCompletedPickups(prev => [{ ...completed, completedAt: new Date().toISOString() }, ...prev]);
    if (setEcoPoints) setEcoPoints(prev => prev + points);
    if (setNotifications) setNotifications(prev => [{ id: Date.now(), text: `Pickup ${id} completed! +₹${points} earned`, time: 'Just now', unread: true }, ...prev]);
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newRoute.type || !newRoute.address) return;
    setPickups([...pickups, { id: `PK-${Math.floor(100 + Math.random() * 900)}`, type: newRoute.type, address: newRoute.address, points: Math.floor(Math.random() * 50) + 20, time: 'New Route' }]);
    setNewRoute({ type: '', address: '' }); setShowAddForm(false);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: 0 }}>Active Pickups Queue</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{showAddForm ? 'Cancel' : '+ Add Route'}</button>
      </div>
      {showAddForm && (
        <form onSubmit={handleAddRoute} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Waste Type</label><input type="text" placeholder="e.g., Household Trash" value={newRoute.type} onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ flex: '2', minWidth: '250px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pickup Address</label><input type="text" placeholder="Enter exact location..." value={newRoute.address} onChange={(e) => setNewRoute({ ...newRoute, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn-primary" style={{ height: '42px' }}>Confirm Route</button></div>
        </form>
      )}
      {pickups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem', display: 'block' }} /><h3>All caught up!</h3><p>No active pickups in your queue right now.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pickups.map(pickup => (
            <div key={pickup.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
              <div><strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{pickup.id} - {pickup.type}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} color="var(--primary)" /> {pickup.address}</p></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleNavigate(pickup.address)}><Navigation size={16} /> Navigate</button>
                <button className="btn-primary" style={{ background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => handleComplete(pickup.id, pickup.points)}><CheckCircle size={16} /> Complete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecyclerPickups;
