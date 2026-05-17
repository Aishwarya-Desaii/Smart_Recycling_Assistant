import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const NGOCampaigns = ({ campaigns, setCampaigns }) => {
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', goal: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/campaigns').then(res => res.json()).then(data => { setCampaigns(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newCampaign.title, description: newCampaign.description, goal: Number(newCampaign.goal) }) });
      const created = await res.json();
      setCampaigns([...campaigns, created]);
    } catch (e) {
      console.error(e);
      setCampaigns([...campaigns, { id: Date.now(), title: newCampaign.title, description: newCampaign.description, goal: Number(newCampaign.goal), collected: 0, participants: 0, status: 'active', color: ['var(--primary)', 'var(--secondary)', 'var(--warning)'][campaigns.length % 3] }]);
    }
    setNewCampaign({ title: '', description: '', goal: 100 }); setShowForm(false);
  };

  const addProgress = async (id, amount) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    try {
      const res = await fetch(`http://localhost:8000/campaigns/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collected: Math.min(campaign.collected + amount, campaign.goal), participants: campaign.participants + 1 }) });
      const updated = await res.json();
      setCampaigns(campaigns.map(c => c.id === id ? updated : c));
    } catch (e) {
      console.error(e);
      setCampaigns(campaigns.map(c => { if (c.id === id) { const nc = Math.min(c.collected + amount, c.goal); return { ...c, collected: nc, participants: c.participants + 1, status: nc >= c.goal ? 'completed' : 'active' }; } return c; }));
    }
  };

  const toggleStatus = async (id) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`http://localhost:8000/campaigns/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      const updated = await res.json();
      setCampaigns(campaigns.map(c => c.id === id ? updated : c));
    } catch (e) { console.error(e); setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c)); }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Calendar color="var(--primary)" /> Campaign Manager</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Campaign'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Campaign Title</label><input type="text" value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} placeholder="e.g., River Cleanup Drive" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ flex: '2', minWidth: '200px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description</label><input type="text" value={newCampaign.description} onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })} placeholder="Brief description..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ minWidth: '120px' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Goal (kg)</label><input type="number" value={newCampaign.goal} onChange={e => setNewCampaign({ ...newCampaign, goal: e.target.value })} min="10" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }} required /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn-primary" style={{ height: '42px' }}>Create Campaign</button></div>
        </form>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {campaigns.map(c => {
          const pct = Math.min(100, Math.round((c.collected / c.goal) * 100));
          return (
            <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: `4px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{c.title}</h3>
                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 'bold', background: c.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : c.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: c.status === 'active' ? 'var(--success)' : c.status === 'completed' ? 'rgb(59, 130, 246)' : 'var(--danger)' }}>{c.status.toUpperCase()}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{c.description}</p>
              <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.8rem' }}><div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '5px', transition: 'width 0.5s ease' }}></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><strong>{c.collected}kg</strong> / {c.goal}kg ({pct}%) • {c.participants} participants</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {c.status !== 'completed' && <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addProgress(c.id, 25)}>+ 25kg Progress</button>}
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: c.status === 'active' ? 'var(--danger)' : 'var(--success)' }} onClick={() => toggleStatus(c.id)}>{c.status === 'active' ? 'Pause' : 'Resume'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NGOCampaigns;
