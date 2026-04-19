import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Low');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async () => {
    if (!inputText.trim()) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          category,
          priority
        }),
      });
      setInputText('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = async (id, oldText) => {
    const newText = window.prompt("Edit Task:", oldText);
    if (newText === null || !newText.trim()) return;
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText })
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  let filteredTasks = tasks;
  if (filter === 'active') filteredTasks = tasks.filter(t => !t.completed);
  else if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);
  else if (filter !== 'all') filteredTasks = tasks.filter(t => t.category === filter);

  const incompleteCount = tasks.filter(t => !t.completed).length;

  return (
    <>
      <div className="sidebar">
        <h2>DASHBOARD</h2>
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Tasks</button>
        <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
        <hr style={{ width: '100%', border: '0.5px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />
        <button className={`filter-btn ${filter === 'Work' ? 'active' : ''}`} onClick={() => setFilter('Work')}>Work</button>
        <button className={`filter-btn ${filter === 'Personal' ? 'active' : ''}`} onClick={() => setFilter('Personal')}>Personal</button>
      </div>

      <div className="main">
        <div className="header">
          <h1>My Daily Desk</h1>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {incompleteCount} task{incompleteCount !== 1 ? 's' : ''} left
          </span>
        </div>

        <div className="input-card">
          <div className="input-row">
            <input 
              type="text" 
              id="task-input" 
              placeholder="Enter task objective..." 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
          </div>
          <div className="meta-row">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Urgent">Urgent</option>
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium</option>
              <option value="High">High Priority</option>
            </select>
            <button className="add-btn" onClick={addTask}>Add Task</button>
          </div>
        </div>

        <div className="task-list">
          {filteredTasks.map(t => (
            <div key={t._id} className={`task-item ${t.completed ? 'completed' : ''}`}>
              <div className="task-main" onClick={() => toggleTask(t._id, t.completed)}>
                <div className="task-checkbox"></div>
                <span className="task-text">{t.text}</span>
                <span className={`badge badge-${t.category.toLowerCase()}`}>{t.category}</span>
                {t.priority === 'High' && <span className="priority-high">● HIGH</span>}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="delete-btn" onClick={() => editTask(t._id, t.text)}>✏️</button>
                <button className="delete-btn" onClick={() => deleteTask(t._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
