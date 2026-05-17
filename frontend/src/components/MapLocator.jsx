import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapLocator = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setLoading(false); },
        (error) => { console.error("Error getting location", error); setLoading(false); }
      );
    } else { setLoading(false); }
  }, []);

  const openDirections = (destination) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
  const openFullMap = () => window.open(location ? `https://www.google.com/maps/search/recycling+center/@${location.lat},${location.lng},13z` : `https://www.google.com/maps/search/recycling+center`, '_blank');

  const centers = [
    { name: "Local E-Waste Facility", type: "Batteries, Electronics Only", time: "Open until 5PM" },
    { name: "City Municipal Recycling", type: "Paper, Cardboard, Metals", time: "Open 24/7" },
    { name: "Green Earth Dropoff", type: "All Plastics, Glass", time: "Open until 7PM" }
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin color="var(--primary)" /> Nearby Recycling Centers</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{loading ? "Locating you..." : (location ? "Found your location! Showing certified drop-off zones near you." : "Enable location services to find the closest drop-off zones.")}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {centers.map((c, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>{c.name}</h3>
                {location && <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '12px', color: 'var(--success)', fontWeight: 'bold' }}>Near you</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Accepts: {c.type}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{c.time}</span>
                <button className="btn-primary" onClick={() => openDirections(c.name)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}><Navigation size={14} style={{ display: 'inline', marginRight: '0.2rem' }} /> Directions</button>
              </div>
            </div>
          ))}
        </div>
        <div className="map-container" style={{ position: 'relative', minHeight: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <iframe width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=recycling+center${location ? `+@${location.lat},${location.lng}` : ''}&z=13&output=embed`}></iframe>
          <button className="btn-primary" onClick={openFullMap} style={{ position: 'absolute', bottom: 20, right: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.3)', background: 'var(--secondary)' }}><MapPin size={18} /> Open Full Map</button>
        </div>
      </div>
    </div>
  );
};

export default MapLocator;
