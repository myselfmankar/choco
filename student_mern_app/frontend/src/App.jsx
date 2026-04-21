import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api/students';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', roll: '', email: '', marks: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const showBanner = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to load students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      showBanner('error', err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    const name = formData.name.trim();
    const roll = formData.roll.trim();
    const email = formData.email.trim();
    const marksRaw = String(formData.marks).trim();

    if (!name) errs.name = 'Name is required';
    else if (name.length < 2) errs.name = 'Name must be at least 2 characters';
    else if (name.length > 60) errs.name = 'Name cannot exceed 60 characters';

    if (!roll) errs.roll = 'Roll number is required';
    else if (roll.length > 20) errs.roll = 'Roll number cannot exceed 20 characters';

    if (!email) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email)) errs.email = 'Please enter a valid email address (e.g. name@example.com)';

    if (marksRaw === '') {
      errs.marks = 'Marks are required';
    } else {
      const m = Number(marksRaw);
      if (Number.isNaN(m)) errs.marks = 'Marks must be a valid number';
      else if (m < 0) errs.marks = 'Marks cannot be less than 0';
      else if (m > 100) errs.marks = 'Marks cannot exceed 100';
    }

    return errs;
  };

  const resetForm = () => {
    setFormData({ name: '', roll: '', email: '', marks: '' });
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showBanner('error', 'Please correct the highlighted fields');
      return;
    }
    setErrors({});

    const payload = {
      name: formData.name.trim(),
      roll: formData.roll.trim(),
      email: formData.email.trim(),
      marks: Number(formData.marks),
    };

    setSubmitting(true);
    try {
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
        }
        if (data.field) {
          setErrors(prev => ({ ...prev, [data.field]: data.message }));
        }
        showBanner('error', data.message || `Request failed (${res.status})`);
        return;
      }

      showBanner('success', editId ? 'Student record updated' : 'Student added successfully');
      resetForm();
      fetchStudents();
    } catch (err) {
      showBanner('error', err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (s) => {
    if (!window.confirm(`Remove "${s.name}" (Roll ${s.roll})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_URL}/${s._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showBanner('error', data.message || 'Failed to delete student');
        return;
      }
      showBanner('success', 'Student removed');
      if (editId === s._id) resetForm();
      fetchStudents();
    } catch (err) {
      showBanner('error', err.message || 'Network error');
    }
  };

  const prepareEdit = (student) => {
    setEditId(student._id);
    setFormData({
      name: student.name,
      roll: student.roll,
      email: student.email,
      marks: student.marks,
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <h1>Student Record System</h1>

      {banner && (
        <div className={`banner banner-${banner.type}`}>
          {banner.text}
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Donald Duck"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>Roll Number</label>
          <input
            type="text"
            name="roll"
            placeholder="e.g. CS2025-017"
            value={formData.roll}
            onChange={handleChange}
            className={errors.roll ? 'input-error' : ''}
          />
          {errors.roll && <div className="field-error">{errors.roll}</div>}
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="donald@duck.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Marks (%)</label>
          <input
            type="number"
            name="marks"
            placeholder="0 â€“ 100"
            min="0"
            max="100"
            value={formData.marks}
            onChange={handleChange}
            className={errors.marks ? 'input-error' : ''}
          />
          {errors.marks && <div className="field-error">{errors.marks}</div>}
        </div>
      </div>

      <div className="form-actions">
        {editId ? (
          <>
            <button
              style={{ backgroundColor: '#27ae60' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Savingâ€¦' : 'Save Changes'}
            </button>
            <button
              type="button"
              style={{ backgroundColor: '#7f8c8d' }}
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Addingâ€¦' : 'Add Student Record'}
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Email</th>
            <th>Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '1.5rem' }}>
                No students yet. Add your first record above.
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.roll}</td>
                <td>{s.email}</td>
                <td>{s.marks}%</td>
                <td>
                  <button className="edit-btn" onClick={() => prepareEdit(s)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteStudent(s)}>Remove</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
