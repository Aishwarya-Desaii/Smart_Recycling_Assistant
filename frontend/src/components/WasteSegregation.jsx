import React, { useState, useEffect } from 'react';
import { Award, BookOpen, PlayCircle } from 'lucide-react';

const WasteSegregation = ({ userProfile, setEcoPoints }) => {
  const [guidelines, setGuidelines] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/educational/guidelines')
      .then(res => res.json())
      .then(data => setGuidelines(data))
      .catch(e => console.error(e));

    fetch('http://localhost:8000/educational/quiz/daily')
      .then(res => res.json())
      .then(data => setQuiz(data))
      .catch(e => console.error(e));
  }, []);

  const handleQuizSubmit = async () => {
    if (Object.keys(quizAnswers).length !== quiz.length || !userProfile?.id) return;
    try {
      const res = await fetch('http://localhost:8000/educational/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userProfile.id, answers: quizAnswers })
      });
      const data = await res.json();
      setQuizFeedback(`You scored ${data.score}/${data.total}! You earned ${data.points_awarded} EcoPoints!`);
      if (data.points_awarded > 0) {
        setEcoPoints(data.new_total);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><BookOpen color="var(--primary)" /> Waste Segregation & Info</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Segregation Guidelines</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {guidelines.length > 0 ? guidelines.map((g, i) => (
              <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: g.color }}></div>
                <strong>{g.type}:</strong> {g.description}
              </li>
            )) : <p>Loading guidelines...</p>}
          </ul>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Awareness & Quizzes</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Take the daily quiz to improve your knowledge and earn bonus points!</p>
          
          {quiz.length > 0 && !quizFeedback ? (
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {quiz.map((q, idx) => (
                <div key={q.id}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.8rem' }}>{idx + 1}. {q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name={`quiz_${q.id}`} value={opt} onChange={(e) => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn-primary" onClick={handleQuizSubmit} style={{ width: '100%', marginTop: '0.5rem' }} disabled={Object.keys(quizAnswers).length !== quiz.length}>
                <Award size={18} /> Submit Answers
              </button>
            </div>
          ) : quizFeedback ? (
            <div style={{ padding: '1.5rem', background: quizFeedback.includes('earned 0') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: quizFeedback.includes('earned 0') ? 'var(--danger)' : 'var(--success)', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center', fontSize: '1.1rem' }}>
              {quizFeedback}
            </div>
          ) : <p>Loading quiz...</p>}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>
            <PlayCircle size={16} /> <span>Watch: How to compost at home</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteSegregation;
