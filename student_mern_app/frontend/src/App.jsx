import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', roll: '', email: '', marks: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.roll) {
      alert('Fill Name and Roll No');
      return;
    }

    try {
      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setEditId(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setFormData({ name: '', roll: '', email: '', marks: '' });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error(err);
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
  };

  return (
    <div className="container">
      <h1>Student Record System</h1>

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Donald Duck"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Roll Number</label>
          <input
            type="text"
            name="roll"
            placeholder="Roll No"
            value={formData.roll}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="donald@duck.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Marks (%)</label>
          <input
            type="number"
            name="marks"
            placeholder="100"
            value={formData.marks}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {editId ? (
        <button style={{ backgroundColor: '#27ae60' }} onClick={handleSubmit}>Save Changes</button>
      ) : (
        <button onClick={handleSubmit}>Add Student Record</button>
      )}

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
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.roll}</td>
              <td>{s.email}</td>
              <td>{s.marks}%</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => prepareEdit(s)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteStudent(s._id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
