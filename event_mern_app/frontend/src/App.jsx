import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api/registrations';

function App() {
  const [registrations, setRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    teamSize: '1'
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing...');
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('Registration Successful! SEE YOU AT PICT.');
        setFormData({ name: '', email: '', phone: '', college: '', teamSize: '1' });
        fetchRegistrations();
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus('Error: Please check your details.');
      }
    } catch (err) {
      setStatus('Server connection failed.');
    }
  };

  return (
    <>
      <div className="hero">
        <h1>Paintball Ops</h1>
        <p>Tactical Shooting Tournament • PICT Campus</p>
        <div className="event-details">
          <div className="detail-pill">May 30, 2026</div>
          <div className="detail-pill">09:00 AM onwards</div>
        </div>
      </div>

      <div className="registration-container">
        <div className="glass-card" style={{ gridColumn: 'span 2', textAlign: 'center', display: status ? 'block' : 'none' }}>
           <h3 style={{ color: '#4ade80' }}>{status}</h3>
        </div>

        <div className="glass-card">
          <h2>Recruit Enrollment</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleInputChange} required placeholder="Major J. Doe" />
            </div>
            <div className="form-group">
              <label>Institutional Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="recuit@pict.edu" />
            </div>
            <div className="form-group">
              <label>Communication Frequency (Phone)</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+91 XXXX XXXX" />
            </div>
            <div className="form-group">
              <label>College Campus</label>
              <input name="college" type="text" value={formData.college} onChange={handleInputChange} required placeholder="PICT, Pune" />
            </div>
            <div className="form-group">
              <label>Squad Size</label>
              <select name="teamSize" value={formData.teamSize} onChange={handleInputChange}>
                <option value="1">Solo Operative</option>
                <option value="2">Duo Squad</option>
                <option value="3">Trio Squad</option>
                <option value="4">Fireteam (4)</option>
                <option value="5">Full Platoon (5)</option>
              </select>
            </div>
            <button type="submit" className="reg-btn">Confirm Deployment</button>
          </form>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <h2 style={{ justifyContent: 'center' }}>Arena Specs</h2>
            <ul style={{ listStyle: 'none', color: '#94a3b8', lineHeight: '2' }}>
                <li>📍 PICT Basketball Court Area</li>
                <li>🔫 High-Pressure Paint Markers</li>
                <li>🛡️ Tactical Gear Provided</li>
                <li>🏆 ₹50,000 Prize Pool</li>
            </ul>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed #fb923c', borderRadius: '10px' }}>
                <small>NOTE: ID Proof mandatory during check-in.</small>
            </div>
        </div>

        <div className="glass-card registrants-card">
          <h2>Deployment Roster</h2>
          <table>
            <thead>
              <tr>
                <th>Recruit Name</th>
                <th>Institution</th>
                <th>Squad</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No recruits registered yet. Be the first!</td>
                </tr>
              ) : (
                registrations.map(reg => (
                  <key key={reg._id}>
                    <td>{reg.name}</td>
                    <td>{reg.college}</td>
                    <td><span className="team-badge">{reg.teamSize} Member{reg.teamSize > 1 ? 's' : ''}</span></td>
                    <td style={{ color: '#4ade80' }}>CONFIRMED</td>
                  </key>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;
