import React, { useState } from 'react';
import { Users } from 'lucide-react';

const NGOVolunteers = ({ volunteers, setVolunteers, campaigns }) => {
  const [showForm, setShowForm] = useState(false);
  const [newVol, setNewVol] = useState({ name: '', role: 'Volunteer', campaign: '' });

  const handleAdd = (e) => { e.preventDefault(); setVolunteers([...volunteers, { id: Date.now(), name: newVol.name, role: newVol.role, hours: 0, campaign: newVol.campaign, status: 'active' }]); setNewVol({ name: '', role: 'Volunteer', campaign: '' }); setShowForm(false); };
  const toggleStatus = (id) => setVolunteers(volunteers.map(v => v.id === id ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v));
  const logHours = (id, hrs) => setVolunteers(volunteers.map(v => v.id === id ? { ...v, hours: v.hours + hrs } : v));

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Users color="var(--primary)" /> Volunteer Manager</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Volunteer'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '180px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label><input type="text" value={newVol.name} onChange={e => setNewVol({ ...newVol, name: e.target.value })} placeholder="Full name" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ minWidth: '150px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role</label><select value={newVol.role} onChange={e => setNewVol({ ...newVol, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}><option value="Volunteer">Volunteer</option><option value="Coordinator">Coordinator</option><option value="Field Lead">Field Lead</option></select></div>
          <div style={{ flex: '1', minWidth: '180px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Assign Campaign</label><select value={newVol.campaign} onChange={e => setNewVol({ ...newVol, campaign: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required><option value="">Select...</option>{campaigns.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}</select></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn-primary" style={{ height: '42px' }}>Add Volunteer</button></div>
        </form>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {volunteers.map(v => (
          <div key={v.id} className="glass-panel" style={{ padding: '1.2rem', background: 'var(--bg-card)', border: `1px solid ${v.status === 'active' ? 'var(--success)' : 'var(--border-color)'}`, opacity: v.status === 'active' ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-main)' }}>{v.name}</strong>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: v.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: v.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>{v.status}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.role} • {v.campaign}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', margin: '0.5rem 0' }}>{v.hours} hrs logged</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => logHours(v.id, 2)}>+2 hrs</button>
              <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: v.status === 'active' ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(v.id)}>{v.status === 'active' ? 'Deactivate' : 'Activate'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NGOVolunteers;
