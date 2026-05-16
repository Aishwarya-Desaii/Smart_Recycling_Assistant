import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, Crosshair, CheckCircle, Upload } from 'lucide-react';

const WasteScanning = ({ setActiveTab, setEcoPoints, setNotifications, userProfile, setUserProfile }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanResult, setScanResult] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isCameraActive && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraActive, mediaStream]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      mediaStream?.getTracks().forEach(t => t.stop());
      setMediaStream(null);
      setIsCameraActive(false); 
      setScanStatus('idle');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setMediaStream(stream);
        setIsCameraActive(true); 
        setScanStatus('idle');
      } catch (err) { alert("Camera access denied"); }
    }
  };

  const fileInputRef = useRef(null);

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  };

  const processScan = async (file, type) => {
    setScanStatus('scanning');
    try {
      const formData = new FormData();
      formData.append('file', file, file.name || 'capture.jpg');
      
      // Use /segment for camera (complex scenes) and /classify for single item uploads
      const endpoint = type === 'cam' ? 'http://localhost:8000/segment' : 'http://localhost:8000/classify';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      let result;
      if (type === 'cam' && data.detections) {
        // Segmentation result
        if (data.detections.length === 0) {
          result = {
            category: 'No Waste Detected',
            bin: 'N/A',
            points: 0,
            image: data.annotated_image
          };
        } else {
          const summary = data.summary;
          let binText = summary.bins_needed.map(b => b.charAt(0).toUpperCase() + b.slice(1) + ' Bin').join(', ');
          if (!binText) binText = 'Unknown';
          
          const categories = Object.entries(summary.class_counts)
            .map(([cls, count]) => `${count}x ${cls}`)
            .join(', ');

          result = {
            category: summary.total_items > 1 ? `${summary.total_items} Items (${categories})` : categories,
            bin: binText,
            points: summary.total_reward_points || 10,
            image: data.annotated_image,
            items_count: summary.total_items || 1
          };
        }
      } else if (type === 'upload' && data.predicted_class) {
        // Classification result
        if (!data.is_confident || !data.guidance) {
          throw new Error('Low confidence detection, please try another image.');
        }
        result = {
          category: data.predicted_class,
          bin: data.guidance.bin_color + ' Bin',
          points: data.guidance.reward_points || 10,
          items_count: 1
        };
      } else {
         throw new Error('No items detected');
      }
      
      setScanResult(result);
      setScanStatus('result');
      if (videoRef.current) videoRef.current.srcObject?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to analyze image. Try again.");
      setScanStatus('idle');
    }
  };

  const handleCameraScan = async () => {
    if (!isCameraActive) return;
    const blob = await captureFrame();
    if (blob) processScan(blob, 'cam');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processScan(file, 'upload');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Waste Scanner</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>FastAPI ML Integration: Instantly classify waste via Camera or Image Upload.</p>

      {scanStatus !== 'result' ? (
        <>
          <div className="scanner-frame" onClick={isCameraActive ? handleCameraScan : undefined} style={{ cursor: isCameraActive ? 'pointer' : 'default', width: '100%', maxWidth: '500px', height: '300px', background: 'var(--bg-dark)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }} />
            {isCameraActive ? (
              <>
                {scanStatus === 'scanning' ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>Analyzing Object...</div></div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 20, width: '100%', textAlign: 'center' }}><span style={{ background: 'var(--glass-bg)', padding: '8px 16px', borderRadius: '20px' }}>Tap frame to capture</span></div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                {scanStatus === 'scanning' ? <div style={{ color: 'var(--primary)' }}>Uploading & Analyzing...</div> : <><Camera size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} /><span>Camera / Preview Area</span></>}
              </div>
            )}
          </div>
          {scanStatus === 'idle' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={toggleCamera}><Video size={18} /> {isCameraActive ? 'Stop Camera' : 'Live Camera'}</button>
              
              {/* Single item classification */}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
              <button className="btn-primary" onClick={() => fileInputRef.current.click()} style={{ background: 'var(--secondary)' }}><Upload size={18} /> Classify Single Item</button>
              
              {/* Multi item segmentation */}
              <input type="file" id="segUpload" onChange={(e) => { if(e.target.files[0]) processScan(e.target.files[0], 'cam') }} accept="image/*" style={{ display: 'none' }} />
              <button className="btn-primary" onClick={() => document.getElementById('segUpload').click()} style={{ background: 'var(--primary)' }}><Crosshair size={18} /> Segment Mixed Waste</button>
            </div>
          )}
        </>
      ) : (
        <div className="scan-card glass-panel blue" style={{ width: '100%', maxWidth: '500px' }}>
          {scanResult.image && (
            <img src={`data:image/jpeg;base64,${scanResult.image}`} alt="Segmented" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} />
          )}
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', textTransform: 'capitalize' }}>{scanResult.category} Detected</h3>
          <p style={{ marginBottom: '0.5rem' }}><strong>Disposal Guidance:</strong> {scanResult.bin}</p>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={async () => {
            if (userProfile?.id && scanResult.points > 0) {
               try {
                 const res = await fetch(`http://localhost:8000/users/${userProfile.id}/scan_impact`, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({ items_count: scanResult.items_count || 1, points_earned: scanResult.points })
                 });
                 if (res.ok) {
                   const updated = await res.json();
                   setUserProfile(prev => ({ ...prev, ...updated }));
                   setEcoPoints(updated.eco_points);
                 } else { setEcoPoints(p => p + scanResult.points); }
               } catch(e) { console.error(e); setEcoPoints(p => p + scanResult.points); }
            } else {
               setEcoPoints(p => p + scanResult.points);
            }
            setScanStatus('idle');
            setNotifications(n => [{ id: Date.now(), text: `Earned ${scanResult.points} Pts!`, time: "Just now", unread: true }, ...n]);
            setActiveTab('dashboard');
          }}><CheckCircle size={18} /> Confirm Disposal (+{scanResult.points} Pts)</button>
        </div>
      )}
    </div>
  );
};

export default WasteScanning;
