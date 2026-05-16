import React, { useState, useEffect, useRef } from 'react';
import { Truck, Star } from 'lucide-react';

const PickupScheduling = ({ setActiveTab, setNotifications }) => {
  const [step, setStep] = useState('request'); // request, tracking, rating

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Truck color="var(--primary)" /> Recycling Pickup Scheduling</h2>
      
      {step === 'request' && (
        <div style={{ maxWidth: '500px' }}>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Waste Type</label><select><option>Bulk E-Waste</option><option>Mixed Recyclables</option><option>Furniture</option></select></div>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Schedule Date & Time</label><input type="datetime-local" /></div>
          <div className="input-group" style={{ marginBottom: '1rem' }}><label>Additional Details / Images</label><input type="text" placeholder="e.g., Heavy items, call upon arrival" /></div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => {
            setNotifications(n => [{ id: Date.now(), text: "System assigned nearest collector: John D.", time: "Just now", unread: true }, ...n]);
            setStep('tracking');
          }}>Request Pickup</button>
        </div>
      )}

      {step === 'tracking' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--success)' }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Pickup Confirmed & Tracking</h3>
            <p style={{ marginBottom: '1rem' }}>Collector <strong>John D.</strong> is on the way.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '15px', height: '15px', background: 'var(--success)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
              <span>Live Status: 5 mins away</span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setStep('rating')}>Simulate Completion</button>
        </div>
      )}

      {step === 'rating' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Rate the Service</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>How was your pickup experience?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map(star => <Star key={star} size={32} color="var(--warning)" style={{ cursor: 'pointer' }} />)}
          </div>
          <button className="btn-primary" onClick={() => {
            setNotifications(n => [{ id: Date.now(), text: "Earned 50 points for pickup feedback!", time: "Just now", unread: true }, ...n]);
            setActiveTab('dashboard');
          }}>Submit Feedback</button>
        </div>
      )}
    </div>
  );
};

export default PickupScheduling;
