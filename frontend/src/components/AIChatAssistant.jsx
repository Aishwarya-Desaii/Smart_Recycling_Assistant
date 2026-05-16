import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Mic, Send, Users } from 'lucide-react';

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm EcoBot, your Smart City AI Assistant. You can speak or type your question below." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = (overrideText = null) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : input;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Based on city guidelines, you should put that in the Blue Bin for dry waste.",
        "E-waste dropoff is scheduled for every second Saturday of the month at Sector 4.",
        "You can earn 50 EcoPoints by dropping off 10 plastic bottles at the nearest Smart Bin.",
        "Composting wet waste at home can reduce your carbon footprint by 15 percent."
      ];

      let reply = responses[Math.floor(Math.random() * responses.length)];
      if (textToSend.toLowerCase().includes("battery") || textToSend.toLowerCase().includes("batteries")) {
        reply = "Old batteries are considered hazardous waste. Please take them to the electronic waste facility at Sector 4.";
      } else if (textToSend.toLowerCase().includes("plastic")) {
        reply = "Please rinse plastic containers and place them in the Blue Dry Waste bin.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
      speakText(reply);
    }, 1500);
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser doesn't support speech recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--glass-border)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0' }}>EcoBot AI</h2>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>● Voice Module Active</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {msg.role === 'user' ? <Users size={16} /> : <Leaf size={16} />}
            </div>
            <div style={{ background: msg.role === 'user' ? 'var(--primary)' : 'var(--glass-border)', padding: '1rem', borderRadius: msg.role === 'user' ? '16px 0 16px 16px' : '0 16px 16px 16px', color: 'var(--text-main)', lineHeight: '1.5', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={16} /></div>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0 16px 16px 16px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both' }}></div>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
              <div style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '50%', animation: 'typingBounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', background: 'var(--glass-border)', alignItems: 'center' }}>
        <button onClick={handleMicClick} style={{ background: isListening ? 'var(--danger)' : 'var(--glass-border)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', animation: isListening ? 'pulse 1s infinite' : 'none', transition: 'all 0.3s' }}>
          <Mic size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? "Listening..." : "Ask EcoBot anything..."}
          style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '25px', color: 'var(--text-main)', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: 'var(--primary)', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;
