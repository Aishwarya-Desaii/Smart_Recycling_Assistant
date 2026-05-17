import React, { useState, useEffect } from 'react';
import { Users, Send } from 'lucide-react';

const CommunityImpact = ({ userProfile, setUserProfile, setEcoPoints }) => {
  const [history, setHistory] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [joinedCampaigns, setJoinedCampaigns] = useState(() => {
    try { const saved = localStorage.getItem('ecosmart_joined_campaigns'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  
  // Refresh user profile from backend on mount to get latest stats
  useEffect(() => {
    if (userProfile?.id) {
      fetch(`http://localhost:8000/users/${userProfile.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUserProfile(prev => ({ ...prev, ...data }));
            setEcoPoints(data.eco_points);
          }
        })
        .catch(e => console.error('Profile refresh error:', e));
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (userProfile?.id) {
      fetch(`http://localhost:8000/users/${userProfile.id}/history`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(e => console.error(e));
    }
    
    // Fetch real campaigns from database (same source as NGO Campaign Manager)
    fetch('http://localhost:8000/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(e => console.error(e));
  }, [userProfile?.id, userProfile?.eco_points]);

  // Auto-refresh campaigns every 5 seconds to catch NGO updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:8000/campaigns')
        .then(res => res.json())
        .then(data => setCampaigns(data))
        .catch(e => console.error(e));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const text = `I just recycled ${userProfile?.total_waste_kg?.toFixed(2) || 0}kg of waste and saved ${userProfile?.total_co2_saved?.toFixed(2) || 0}kg of CO₂ on the EcoSmart Platform! Join me in saving the planet! 🌍♻️`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Eco Impact', text: text, url: window.location.href });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Impact stats copied to clipboard! You can now paste and share them.");
    }
  };

  const handleJoinCampaign = async (campaignId) => {
    if (joinedCampaigns.includes(campaignId)) return;
    try {
      // Update participant count in the backend
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        const res = await fetch(`http://localhost:8000/campaigns/${campaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participants: campaign.participants + 1 })
        });
        const updated = await res.json();
        setCampaigns(campaigns.map(c => c.id === campaignId ? updated : c));
      }
    } catch (e) {
      console.error(e);
    }
    const newJoined = [...joinedCampaigns, campaignId];
    setJoinedCampaigns(newJoined);
    localStorage.setItem('ecosmart_joined_campaigns', JSON.stringify(newJoined));
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Users color="var(--primary)" /> Community & Impact</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Your Impact Tracker</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Waste Recycled:</span> <strong>{userProfile?.total_waste_kg ? userProfile.total_waste_kg.toFixed(2) : 0} kg</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CO₂ Saved:</span> <strong>{userProfile?.total_co2_saved ? userProfile.total_co2_saved.toFixed(2) : 0} kg</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Trees Saved:</span> <strong>{userProfile?.trees_saved ? userProfile.trees_saved.toFixed(2) : 0}</strong></div>
          </div>
          
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.8rem', color: 'var(--text-main)' }}>Scan History</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(history) && history.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scans yet.</p> : Array.isArray(history) ? history.map(item => (
              <div key={item.id} style={{ background: 'var(--bg-card)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <strong>{new Date(item.timestamp).toLocaleDateString()}</strong>
                  <span style={{ color: 'var(--success)' }}>+{item.points_earned} Pts</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {item.items_count} items ({item.waste_kg}kg waste) ➔ {item.co2_saved}kg CO₂ saved
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)' }}>Error loading history.</p>}
          </div>
          
          <button className="btn-primary" onClick={handleShare} style={{ width: '100%', marginTop: '1.5rem', background: 'var(--primary)' }}><Send size={16} /> Share on Social Media</button>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Active Campaigns & Challenges</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {campaigns.length > 0 ? campaigns.filter(c => c.status === 'active' || c.status === 'completed').map(c => {
              const pct = Math.min(100, Math.round((c.collected / c.goal) * 100));
              const isJoined = joinedCampaigns.includes(c.id);
              return (
                <div key={c.id} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: `4px solid ${c.color}` }}>
                  <h4 style={{ color: c.color, marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {c.title}
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold', background: c.status === 'completed' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)', color: c.status === 'completed' ? 'rgb(59, 130, 246)' : 'var(--success)' }}>
                      {c.status === 'completed' ? '🎉 COMPLETED' : `${pct}%`}
                    </span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>{c.description}</p>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--success)' : c.color, borderRadius: '4px', transition: 'width 0.5s ease', boxShadow: `0 0 8px ${c.color}40` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><strong>{c.collected}kg</strong> / {c.goal}kg • {c.participants} joined</span>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleJoinCampaign(c.id)}
                      disabled={isJoined || c.status === 'completed'}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: isJoined ? 'var(--text-muted)' : c.status === 'completed' ? 'rgb(59, 130, 246)' : 'var(--primary)', cursor: isJoined || c.status === 'completed' ? 'not-allowed' : 'pointer' }}
                    >
                      {isJoined ? 'Joined ✓' : c.status === 'completed' ? 'Completed' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              );
            }) : <p>Loading campaigns...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityImpact;
