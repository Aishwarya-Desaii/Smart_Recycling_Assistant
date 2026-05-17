import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Activity, Truck, CheckCircle, MapPin, AlertTriangle, Leaf, Coins, Trash2, Bell, RefreshCw, Search } from 'lucide-react';

const API = 'http://localhost:8000';

const AdminDashboardPage = ({ setActiveTab, fleetTrucks, pickups, completedPickups }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [wasteData, setWasteData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/admin/stats`).then(r => r.json()).catch(() => null),
      fetch(`${API}/admin/users`).then(r => r.json()).catch(() => []),
      fetch(`${API}/admin/recent-scans`).then(r => r.json()).catch(() => []),
      fetch(`${API}/admin/waste-breakdown`).then(r => r.json()).catch(() => null),
      fetch(`${API}/admin/alerts`).then(r => r.json()).catch(() => []),
    ]).then(([s, u, sc, w, a]) => {
      if (s) setStats(s);
      setUsers(u);
      setRecentScans(sc);
      if (w) setWasteData(w);
      setAlerts(a);
      setLoading(false);
    });
  }, [refreshKey]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${API}/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
      setRefreshKey(k => k + 1);
    } catch (e) { console.error(e); }
  };

  const activeTrucks = fleetTrucks ? fleetTrucks.filter(t => t.status === 'active').length : 0;
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alertColor = (type) => type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'rgb(59, 130, 246)';
  const alertBg = (type) => type === 'success' ? 'rgba(16,185,129,0.1)' : type === 'warning' ? 'rgba(251,191,36,0.1)' : 'rgba(59,130,246,0.1)';
  const roleBadge = (role) => {
    const colors = { Citizen: 'var(--primary)', Recycler: 'var(--secondary)', NGO: 'var(--warning)', Admin: 'rgb(139,92,246)' };
    return colors[role] || 'var(--text-muted)';
  };

  if (loading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
        <RefreshCw size={40} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-muted)' }}>Loading Admin Dashboard...</h3>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

      {/* Header */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2.5rem', background: 'radial-gradient(circle at top left, rgba(139,92,246,0.12), transparent), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent), var(--glass-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <ShieldCheck color="var(--primary)" size={35} /> Command Center
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              <strong>{stats?.total_users || 0}</strong> registered users • <strong>{stats?.total_scans || 0}</strong> total scans • <strong>{stats?.scans_today || 0}</strong> scans today
            </p>
          </div>
          <button className="btn-primary" onClick={() => setRefreshKey(k => k + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} /> Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="glass-panel stat-card" style={{ gridColumn: 'span 3', borderTop: '4px solid var(--primary)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('users')}>
        <Users size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>TOTAL USERS</p>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{stats?.total_users || 0}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {stats?.role_breakdown && Object.entries(stats.role_breakdown).map(([role, count]) => (
            <span key={role} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '8px', background: `${roleBadge(role)}22`, color: roleBadge(role), fontWeight: 'bold' }}>
              {count} {role}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel stat-card" style={{ gridColumn: 'span 3', borderTop: '4px solid var(--success)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('analytics')}>
        <Leaf size={28} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>WASTE RECYCLED</p>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{stats?.total_waste_kg || 0}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> kg</span></h3>
      </div>

      <div className="glass-panel stat-card" style={{ gridColumn: 'span 3', borderTop: '4px solid var(--warning)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('analytics')}>
        <Activity size={28} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>CO₂ SAVED</p>
        <h3 style={{ fontSize: '2.5rem', color: 'var(--warning)' }}>{stats?.total_co2_saved || 0}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> kg</span></h3>
      </div>

      <div className="glass-panel stat-card" style={{ gridColumn: 'span 3', borderTop: '4px solid rgb(139,92,246)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('fleet')}>
        <Truck size={28} color="rgb(139,92,246)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.3rem' }}>ACTIVE FLEET</p>
        <h3 style={{ fontSize: '2.5rem', color: 'rgb(139,92,246)' }}>{activeTrucks}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / {fleetTrucks?.length || 0}</span></h3>
      </div>

      {/* System Alerts */}
      <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="var(--warning)" /> System Alerts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '220px', overflowY: 'auto' }}>
          {alerts.length > 0 ? alerts.map((a, i) => (
            <div key={i} style={{ padding: '0.8rem', background: alertBg(a.type), borderRadius: '10px', borderLeft: `3px solid ${alertColor(a.type)}`, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                {a.type === 'warning' && <AlertTriangle size={14} color="var(--warning)" />}
                {a.type === 'success' && <CheckCircle size={14} color="var(--success)" />}
                {a.type === 'info' && <Activity size={14} color="rgb(59,130,246)" />}
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', color: alertColor(a.type) }}>{a.severity}</span>
              </div>
              {a.message}
            </div>
          )) : <p style={{ color: 'var(--text-muted)' }}>No alerts</p>}
        </div>

        {/* Quick Stats */}
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total EcoPoints</span>
            <strong style={{ color: 'var(--primary)' }}>{stats?.total_eco_points?.toLocaleString() || 0}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Trees Saved</span>
            <strong style={{ color: 'var(--success)' }}>{stats?.total_trees_saved || 0}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending Pickups</span>
            <strong style={{ color: 'var(--warning)' }}>{pickups?.length || 0}</strong>
          </div>
        </div>
      </div>

      {/* Zone Activity Chart */}
      <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '2rem', background: 'rgba(20,20,25,0.95)', border: '1px solid var(--glass-border)' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Activity size={20} color="var(--primary)" /> Zone-Wise Waste Collection (kg)
        </h3>
        {wasteData?.zone_distribution ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '1.5rem', paddingBottom: '35px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, width: '100%', height: '1px', background: 'var(--bg-card)' }} />
            <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', background: 'var(--bg-card)' }} />
            {wasteData.zone_distribution.map(z => {
              const maxVal = Math.max(...wasteData.zone_distribution.map(d => d.waste_kg), 1);
              const pct = Math.max(8, (z.waste_kg / maxVal) * 100);
              const colors = { North: '#10b981', South: '#06b6d4', East: '#f59e0b', West: '#8b5cf6', Central: '#ec4899' };
              return (
                <div key={z.zone} style={{ width: '70px', height: `${pct}%`, background: `linear-gradient(to top, ${colors[z.zone] || '#10b981'}33, ${colors[z.zone] || '#10b981'})`, borderRadius: '8px 8px 0 0', position: 'relative', transition: 'height 1s ease', boxShadow: `0 -5px 20px ${colors[z.zone] || '#10b981'}33` }}>
                  <span style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>{z.waste_kg}</span>
                  <span style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{z.zone}</span>
                </div>
              );
            })}
          </div>
        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No zone data available yet</p>}
      </div>

      {/* Recent Scan Activity Feed */}
      <div className="glass-panel" style={{ gridColumn: 'span 6', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--secondary)" /> Recent Scan Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
          {recentScans.length > 0 ? recentScans.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-card)', borderRadius: '10px', borderLeft: `3px solid ${s.items_count === 0 ? 'var(--warning)' : 'var(--primary)'}` }}>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{s.user_name}</strong>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: `${roleBadge(s.user_role)}22`, color: roleBadge(s.user_role), fontWeight: 'bold', marginLeft: '0.4rem' }}>{s.user_role}</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {s.items_count === 0 ? 'Quiz completed' : `${s.items_count} items scanned • ${s.waste_kg}kg`} • {new Date(s.timestamp).toLocaleString()}
                </p>
              </div>
              <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>+{s.points_earned} pts</span>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No scan activity yet. Citizens will appear here when they scan waste.</p>}
        </div>
      </div>

      {/* Fleet & Pickups Summary */}
      <div className="glass-panel" style={{ gridColumn: 'span 6', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={20} color="var(--primary)" /> Fleet & Pickup Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>ACTIVE</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--success)' }}>{activeTrucks}</h3>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(251,191,36,0.1)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>IDLE/MAINT.</p>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--warning)' }}>{(fleetTrucks?.length || 0) - activeTrucks}</h3>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>PENDING</p>
            <h3 style={{ fontSize: '1.8rem', color: 'rgb(59,130,246)' }}>{pickups?.length || 0}</h3>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>COMPLETED</p>
            <h3 style={{ fontSize: '1.8rem', color: 'rgb(139,92,246)' }}>{completedPickups?.length || 0}</h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-primary" onClick={() => setActiveTab('fleet')} style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem' }}>
            <Truck size={16} /> Manage Fleet
          </button>
          <button className="btn-primary" onClick={() => setActiveTab('analytics')} style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            <Activity size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel" style={{ gridColumn: 'span 12', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={20} color="var(--primary)" /> Registered Users ({users.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem', width: '220px' }} />
          </div>
        </div>
        {filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 1rem' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Points</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Waste (kg)</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>CO₂ Saved</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Trees</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ background: 'var(--bg-card)', borderRadius: '10px' }}>
                    <td style={{ padding: '0.8rem 1rem', borderRadius: '10px 0 0 10px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{u.name}</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{u.email}</p>
                    </td>
                    <td style={{ padding: '0.8rem 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: `${roleBadge(u.role)}22`, color: roleBadge(u.role), fontWeight: 'bold' }}>{u.role}</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{u.eco_points}</td>
                    <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem', color: 'var(--text-main)' }}>{u.total_waste_kg}</td>
                    <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem', color: 'var(--success)' }}>{u.total_co2_saved} kg</td>
                    <td style={{ textAlign: 'right', padding: '0.8rem 0.5rem', color: 'var(--warning)' }}>{u.trees_saved}</td>
                    <td style={{ textAlign: 'center', padding: '0.8rem 0.5rem', borderRadius: '0 10px 10px 0' }}>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '0.3rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{searchTerm ? 'No users match your search.' : 'No users registered yet.'}</p>}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
