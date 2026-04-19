import { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './index.css';

const API_BASE = '/api';

function App() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video', 'doc'
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleteModal, setDeleteModal] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const uploadFiles = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      fetchFiles();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    uploadFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const downloadFile = (id, originalName) => {
    window.open(`${API_BASE}/files/${id}/download`);
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      await fetch(`${API_BASE}/files/${deleteModal._id}`, { method: 'DELETE' });
      fetchFiles();
      setDeleteModal(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFilteredFiles = () => {
    return files.filter(f => {
      const matchesSearch = f.originalName.toLowerCase().includes(search.toLowerCase());
      const type = f.mimeType.toLowerCase();
      
      let matchesFilter = true;
      if (filter === 'image') matchesFilter = type.startsWith('image/');
      else if (filter === 'video') matchesFilter = type.startsWith('video/');
      else if (filter === 'doc') matchesFilter = type.includes('pdf') || type.includes('word') || type.includes('text') || type.includes('document');

      return matchesSearch && matchesFilter;
    });
  };

  const filteredFiles = getFilteredFiles();
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const storageLimit = 50 * 1024 * 1024 * 1024; // 50GB
  const percentUsed = (totalSize / storageLimit) * 100;

  const countByType = (typeKey) => {
    return files.filter(f => {
        const type = f.mimeType.toLowerCase();
        if (typeKey === 'image') return type.startsWith('image/');
        if (typeKey === 'video') return type.startsWith('video/');
        if (typeKey === 'doc') return type.includes('pdf') || type.includes('word') || type.includes('text') || type.includes('document');
        return true;
    }).length;
  };

  const getFileIcon = (mimeType) => {
    const type = mimeType.toLowerCase();
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return '📦';
    return '📄';
  };

  return (
    <>
      {/* Impressive Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="modal-icon">🗑️</span>
            <h2 className="modal-title">Delete File?</h2>
            <p className="modal-desc">
              You are about to delete <strong>{deleteModal.originalName}</strong>.<br/>
              This action is permanent and cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn-modal" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-modal danger" onClick={confirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          AURA CLOUD
        </div>

        <div className="storage-card">
          <div className="storage-header">
            <span>STORAGE</span>
            <span>{percentUsed.toFixed(1)}%</span>
          </div>
          <div className="storage-bar">
            <div className="storage-fill" style={{ width: `${percentUsed}%` }}></div>
          </div>
          <div className="storage-header" style={{ color: 'var(--dim)', fontSize: '0.65rem' }}>
            <span>{formatSize(totalSize)} USED</span>
            <span>50 GB CAP</span>
          </div>
        </div>

        <div className="category-list">
            <div style={{ color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>FILES</div>
            <button className={`category-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                <span>📂 All Files</span> <span>{files.length}</span>
            </button>
            <button className={`category-btn ${filter === 'image' ? 'active' : ''}`} onClick={() => setFilter('image')}>
                <span>🖼️ Photos</span> <span>{countByType('image')}</span>
            </button>
            <button className={`category-btn ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>
                <span>🎬 Videos</span> <span>{countByType('video')}</span>
            </button>
            <button className={`category-btn ${filter === 'doc' ? 'active' : ''}`} onClick={() => setFilter('doc')}>
                <span>📄 Documents</span> <span>{countByType('doc')}</span>
            </button>
        </div>
      </div>

      <div className="main">
        <div className="header">
          <h1>Storage Dashboard</h1>
          <input 
            type="text" 
            className="search-box" 
            placeholder="Search files..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <span className="dropzone-icon">{isDragActive ? '📥' : '☁️'}</span>
          <p>
            {isDragActive 
              ? 'Drop files to upload...' 
              : uploading 
                ? `Uploading ${progress}%` 
                : 'Click or drop files to upload to AURA'}
          </p>
          {uploading && (
            <div style={{ marginTop: '1.5rem' }}>
              <progress value={progress} max="100"></progress>
            </div>
          )}
        </div>

        <div className="file-list">
          <div className="file-row file-header">
            <div></div>
            <div>NAME</div>
            <div>SIZE</div>
            <div>DATE</div>
            <div style={{ textAlign: 'right' }}>ACTIONS</div>
          </div>

          {filteredFiles.map(file => (
            <div key={file._id} className="file-row">
              <div style={{ fontSize: '1.2rem' }}>{getFileIcon(file.mimeType)}</div>
              <div className="file-name">{file.originalName}</div>
              <div className="file-meta">{formatSize(file.size)}</div>
              <div className="file-meta">{new Date(file.uploadedAt).toLocaleDateString()}</div>
              <div className="action-btns">
                <button className="btn-icon" onClick={() => downloadFile(file._id, file.originalName)}>⬇️</button>
                <button className="btn-icon delete" onClick={() => setDeleteModal(file)}>🗑️</button>
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && !uploading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--dim)' }}>
                No files found in your AURA storage.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
