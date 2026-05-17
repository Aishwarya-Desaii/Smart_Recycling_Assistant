import React, { useState, useEffect } from 'react';
import { Leaf, Coins, Bell, LogOut } from 'lucide-react';
import './App.css';

// Citizen components
import CitizenDashboard from './components/CitizenDashboard';
import WasteScanning from './components/WasteScanning';
import WasteSegregation from './components/WasteSegregation';
import RewardsGamification from './components/RewardsGamification';
import CommunityImpact from './components/CommunityImpact';
import MapLocator from './components/MapLocator';
import TruckSchedule from './components/TruckSchedule';

// Recycler components
import RecyclerDashboard from './components/RecyclerDashboard';
import RecyclerPickups from './components/RecyclerPickups';
import RecyclerEarnings from './components/RecyclerEarnings';

// NGO components
import NGODashboard from './components/NGODashboard';
import NGOCampaigns from './components/NGOCampaigns';
import NGOVolunteers from './components/NGOVolunteers';

// Admin components
import AdminDashboardPage from './components/AdminDashboard';
import AdminCommandCenter from './components/AdminCommandCenter';
import AdminFleet from './components/AdminFleet';
import AdminAnalytics from './components/AdminAnalytics';

// Shared components
import AIChatAssistant from './components/AIChatAssistant';
import PickupScheduling from './components/PickupScheduling';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userProfile, setUserProfile] = useState({ name: 'User', role: 'Citizen', location: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome to EcoSmart City Platform!", time: "Just now", unread: true }]);
  const [ecoPoints, setEcoPoints] = useState(1250);
  const [adminStats, setAdminStats] = useState([{ zone: 'North', val: 45 }, { zone: 'South', val: 62 }, { zone: 'East', val: 30 }]);
  const defaultPickups = [
    { id: 'PK-101', type: 'Bulk E-Waste', address: 'Mahalakshmi Temple, Kolhapur, Maharashtra', points: 50, time: '10:00 AM - 11:30 AM' },
    { id: 'PK-102', type: 'Industrial Scrap', address: 'Rankala Lake, Kolhapur, Maharashtra', points: 100, time: '01:00 PM - 02:30 PM' },
    { id: 'PK-103', type: 'Mixed Recycling', address: 'Shivaji University, Kolhapur, Maharashtra', points: 30, time: '04:00 PM - 05:30 PM' }
  ];
  const [pickups, setPickups] = useState(() => {
    try { const saved = localStorage.getItem('ecosmart_pickups'); return saved ? JSON.parse(saved) : defaultPickups; }
    catch { return defaultPickups; }
  });
  const [completedPickups, setCompletedPickups] = useState(() => {
    try { const saved = localStorage.getItem('ecosmart_completed'); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [campaigns, setCampaigns] = useState([
    { id: 1, title: 'Plastic-Free Week', description: 'Join 450 neighbors in reducing plastic waste.', goal: 1000, collected: 750, participants: 450, status: 'active', color: 'var(--primary)' },
    { id: 2, title: 'Downtown Clean-up', description: 'This Saturday, 10 AM. Help the community.', goal: 500, collected: 200, participants: 85, status: 'active', color: 'var(--warning)' }
  ]);
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: 'Rahul Sharma', role: 'Field Lead', hours: 24, campaign: 'Plastic-Free Week', status: 'active' },
    { id: 2, name: 'Priya Patel', role: 'Coordinator', hours: 18, campaign: 'Downtown Clean-up', status: 'active' },
    { id: 3, name: 'Amit Desai', role: 'Volunteer', hours: 12, campaign: 'Plastic-Free Week', status: 'active' },
    { id: 4, name: 'Sneha Kulkarni', role: 'Volunteer', hours: 8, campaign: 'Downtown Clean-up', status: 'inactive' }
  ]);
  const [fleetTrucks, setFleetTrucks] = useState([
    { id: 'TRK-01', zone: 'North', status: 'active', driver: 'Rajesh K.', capacity: 75 },
    { id: 'TRK-02', zone: 'South', status: 'active', driver: 'Suresh M.', capacity: 60 },
    { id: 'TRK-03', zone: 'East', status: 'maintenance', driver: 'Vikram P.', capacity: 0 },
    { id: 'TRK-04', zone: 'West', status: 'idle', driver: 'Deepak R.', capacity: 30 }
  ]);
  const ecoLevel = ecoPoints > 1500 ? "Zero Waste Master" : ecoPoints > 500 ? "Green Champion" : "Beginner";

  // Persist pickups & completedPickups to localStorage for cross-tab sync
  useEffect(() => { localStorage.setItem('ecosmart_pickups', JSON.stringify(pickups)); }, [pickups]);
  useEffect(() => { localStorage.setItem('ecosmart_completed', JSON.stringify(completedPickups)); }, [completedPickups]);

  // Listen for changes from other browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ecosmart_pickups' && e.newValue) {
        try { setPickups(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'ecosmart_completed' && e.newValue) {
        try { setCompletedPickups(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Handle back button / history pop
    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('dashboard');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update history when activeTab changes (but not on popstate)
  const changeTab = (tabId) => {
    if (tabId !== activeTab) {
      window.history.pushState({ tab: tabId }, '', `#${tabId}`);
      setActiveTab(tabId);
    }
  };

  useEffect(() => {
    if (userProfile.role === 'Admin') {
      const id = setInterval(() => setAdminStats(p => p.map(s => ({ ...s, val: Math.max(10, Math.min(100, s.val + Math.floor(Math.random() * 11) - 5)) }))), 3000);
      return () => clearInterval(id);
    }
  }, [userProfile.role]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawName = formData.get('name') || formData.get('email').split('@')[0];
    const email = formData.get('email');
    const role = formData.get('role') || 'Citizen';
    
    try {
      const res = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rawName, email, role })
      });
      const userData = await res.json();
      setUserProfile(userData);
      setEcoPoints(userData.eco_points);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login failed:", err);
      // Fallback if backend is down
      setUserProfile({ id: 1, name: rawName, role, email, total_waste_kg: 0, total_co2_saved: 0, trees_saved: 0 });
      setIsLoggedIn(true);
    }
    changeTab('dashboard');
  };

  const roleNavLinks = {
    Citizen: [
      { id: 'dashboard', label: 'Home' }, 
      { id: 'scanning', label: 'Scan Waste' }, 
      { id: 'segregation', label: 'Learn & Segregate' }, 
      { id: 'rewards', label: 'Rewards' }, 
      { id: 'community', label: 'Impact' },
      { id: 'map', label: 'Locate' },
      { id: 'trucks', label: 'Trucks' },
      { id: 'chat', label: 'EcoBot AI' }
    ],
    Recycler: [{ id: 'dashboard', label: 'Overview' }, { id: 'pickups', label: 'Active Pickups' }, { id: 'earnings', label: 'Earnings' }, { id: 'chat', label: 'EcoBot AI' }],
    NGO: [{ id: 'dashboard', label: 'Overview' }, { id: 'campaigns', label: 'Campaigns' }, { id: 'volunteers', label: 'Volunteers' }, { id: 'chat', label: 'EcoBot AI' }],
    Admin: [{ id: 'dashboard', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'fleet', label: 'Fleet Management' }, { id: 'analytics', label: 'Analytics' }, { id: 'chat', label: 'EcoBot AI' }]
  };

  const navLinks = roleNavLinks[userProfile.role] || roleNavLinks['Citizen'];

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-box glass-panel animate-fade-in">
          <div className="auth-header"><div className="logo"><Leaf className="logo-icon" size={40} /><span>Eco<span className="text-gradient">Smart</span></span></div>
            <p>Authentication Service: Select your role to login</p></div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <><div className="input-group"><label>Full Name</label><input type="text" name="name" required /></div><div className="input-group"><label>Location</label><input type="text" name="location" placeholder="City or Zip" required /></div></>
            )}
            <div className="input-group">
              <label>User Role (Determines Dashboard System)</label>
              <select name="role" required style={{ background: 'var(--bg-card)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}>
                <option value="Citizen">1. Citizen / Resident</option>
                <option value="Recycler">2. Recycler / Collector</option>
                <option value="NGO">3. NGO / Community Organizer</option>
                <option value="Admin">4. Municipality Admin</option>
              </select>
            </div>
            <div className="input-group"><label>Email Address</label><input type="email" name="email" required /></div>
            <div className="input-group"><label>Password</label><input type="password" name="password" required /></div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>{authMode === 'login' ? 'Login to Portal' : 'Register Account'}</button>
          </form>
          <div className="auth-toggle"><span onClick={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Switch to Sign Up' : 'Switch to Login'}</span></div>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (userProfile.role) {
      case 'Citizen':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
        if (activeTab === 'scanning') return <WasteScanning setActiveTab={changeTab} setEcoPoints={setEcoPoints} setNotifications={setNotifications} userProfile={userProfile} setUserProfile={setUserProfile} />;
        if (activeTab === 'segregation') return <WasteSegregation userProfile={userProfile} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'rewards') return <RewardsGamification userProfile={userProfile} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'community') return <CommunityImpact userProfile={userProfile} setUserProfile={setUserProfile} setEcoPoints={setEcoPoints} />;
        if (activeTab === 'map') return <MapLocator />;
        if (activeTab === 'trucks') return <TruckSchedule pickups={pickups} />;
        return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
      case 'Recycler':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} ecoPoints={ecoPoints} pickups={pickups} />;
        if (activeTab === 'pickups') return <RecyclerPickups setEcoPoints={setEcoPoints} pickups={pickups} setPickups={setPickups} setCompletedPickups={setCompletedPickups} setNotifications={setNotifications} />;
        if (activeTab === 'earnings') return <RecyclerEarnings ecoPoints={ecoPoints} completedPickups={completedPickups} />;
        return <RecyclerDashboard userProfile={userProfile} setActiveTab={setActiveTab} ecoPoints={ecoPoints} pickups={pickups} />;
      case 'NGO':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard') return <NGODashboard setActiveTab={changeTab} campaigns={campaigns} setCampaigns={setCampaigns} volunteers={volunteers} />;
        if (activeTab === 'campaigns') return <NGOCampaigns campaigns={campaigns} setCampaigns={setCampaigns} />;
        if (activeTab === 'volunteers') return <NGOVolunteers volunteers={volunteers} setVolunteers={setVolunteers} campaigns={campaigns} />;
        return <NGODashboard setActiveTab={changeTab} campaigns={campaigns} volunteers={volunteers} />;
      case 'Admin':
        if (activeTab === 'chat') return <AIChatAssistant />;
        if (activeTab === 'dashboard' || activeTab === 'users') return <AdminDashboardPage setActiveTab={changeTab} fleetTrucks={fleetTrucks} pickups={pickups} completedPickups={completedPickups} />;
        if (activeTab === 'fleet') return <AdminFleet fleetTrucks={fleetTrucks} setFleetTrucks={setFleetTrucks} pickups={pickups} />;
        if (activeTab === 'analytics') return <AdminAnalytics adminStats={adminStats} pickups={pickups} completedPickups={completedPickups} fleetTrucks={fleetTrucks} />;
        return <AdminDashboardPage setActiveTab={changeTab} fleetTrucks={fleetTrucks} pickups={pickups} completedPickups={completedPickups} />;
      default: return <CitizenDashboard setActiveTab={changeTab} ecoPoints={ecoPoints} setEcoPoints={setEcoPoints} userProfile={userProfile} />;
    }
  };

  return (
    <div className="app-container">
      <header className="main-header glass-panel">
        <div className="logo animate-fade-in" onClick={() => changeTab('dashboard')} style={{ cursor: 'pointer' }}>
          <Leaf className="logo-icon" size={32} /><span>Eco<span className="text-gradient">Smart</span></span>
        </div>

        <nav className="nav-links">
          {navLinks.map(link => (
            <div key={link.id} className={`nav-link ${activeTab === link.id ? 'active' : ''}`} onClick={() => changeTab(link.id)}>
              {link.label}
            </div>
          ))}
        </nav>

        <div className="user-profile">
          <div style={{ position: 'relative', cursor: 'pointer', marginRight: '0.5rem' }} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color={notifications.some(n => n.unread) ? 'var(--primary)' : 'var(--text-muted)'} />
            {notifications.some(n => n.unread) && <div style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%' }}></div>}
            {showNotifications && (
              <div className="glass-panel" style={{ position: 'absolute', top: '30px', right: '-50px', width: '300px', padding: '1rem', zIndex: 200, background: 'var(--bg-card)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)' }}>Notifications</h4><button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setNotifications(n => n.map(x => ({ ...x, unread: false })))}>Mark read</button>
                </div>
                {notifications.map(n => <div key={n.id} style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--glass-border)', padding: '0.75rem 0', color: n.unread ? 'var(--text-main)' : 'var(--text-muted)' }}><strong style={{ fontWeight: n.unread ? '700' : '500' }}>{n.text}</strong><br /><span style={{ color: 'var(--text-muted)' }}>{n.time}</span></div>)}
              </div>
            )}
          </div>

          {userProfile.role === 'Citizen' && (
            <div className="eco-wallet animate-float" title="Reward Points">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Coins size={18} /><span>{ecoPoints} Pts</span></div>
              <span className="eco-level" style={{ color: 'var(--primary)' }}>{ecoLevel}</span>
            </div>
          )}

          <div className="avatar" title={`${userProfile.name} (${userProfile.role})`}>{userProfile.name.charAt(0).toUpperCase()}</div>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}><LogOut size={20} /></button>
        </div>
      </header>

      <main className="main-content">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
