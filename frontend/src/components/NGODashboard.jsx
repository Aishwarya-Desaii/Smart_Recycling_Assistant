import React, { useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';

const NGODashboard = ({ setActiveTab, campaigns, setCampaigns, volunteers }) => {
  useEffect(() => {
    fetch('http://localhost:8000/campaigns').then(res => res.json()).then(data => setCampaigns(data)).catch(e => console.error(e));
  }, []);

  const totalCollected = campaigns.reduce((s, c) => s + c.collected, 0);
  const activeVols = volunteers.filter(v => v.status === 'active').length;
  const activeCampaign = campaigns.find(c => c.status === 'active');

  return (
    <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), var(--glass-bg)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Community Impact Hub 🤝</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>Managing <strong>{campaigns.length} campaigns</strong> with <strong>{activeVols} active volunteers</strong>. Total waste collected: <strong>{totalCollected}kg</strong>.</p>
      </div>
      <div className="glass-panel stat-card" onClick={() => setActiveTab('campaigns')} style={{ gridColumn: 'span 7', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="stat-icon blue" style={{ width: '70px', height: '70px', boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}><Calendar size={35} /></div>
          <span style={{ padding: '0.5rem 1rem', background: activeCampaign ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: activeCampaign ? 'var(--success)' : 'var(--danger)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>{activeCampaign ? 'LIVE NOW' : 'NO ACTIVE'}</span>
        </div>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{activeCampaign ? activeCampaign.title : 'No Active Campaign'}</h3>
        {activeCampaign && <>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', margin: '1rem 0', overflow: 'hidden' }}><div style={{ width: `${Math.min(100, (activeCampaign.collected / activeCampaign.goal) * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', boxShadow: '0 0 10px var(--primary)', transition: 'width 0.5s ease' }}></div></div>
          <p style={{ color: 'var(--text-muted)' }}><strong>{activeCampaign.collected}kg</strong> / {activeCampaign.goal}kg Goal. {activeCampaign.participants} Citizens Active.</p>
        </>}
      </div>
      <div className="glass-panel stat-card" onClick={() => setActiveTab('volunteers')} style={{ gridColumn: 'span 5', cursor: 'pointer', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-icon green" style={{ width: '60px', height: '60px', marginBottom: '1.5rem' }}><Users size={30} /></div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Volunteer Network</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Manage assignments and verify hours.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{activeVols}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'right' }}>Active<br />Members</span>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
