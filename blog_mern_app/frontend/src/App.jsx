import { useState, useEffect } from 'react';
import './index.css';

// We'll use absolute URLs during dev unless proxy is set
const API_URL = '/api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addPost = async () => {
    if (!title || !content) {
      alert("Please fill title and content");
      return;
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author: 'Contributor' }),
      });
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const editPost = async (id, oldTitle, oldContent) => {
    const newTitle = prompt('Edit Title:', oldTitle);
    const newContent = prompt('Edit Content:', oldContent);

    if (newTitle === null || newContent === null) return;
    if (!newTitle || !newContent) {
      alert('Title and Content cannot be empty');
      return;
    }

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Community Insight Blog</h1>

      <div id="create-post">
        <h2>Share a Story</h2>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            rows="4"
            placeholder="Write your blog post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        <button onClick={addPost}>Publish Post</button>
      </div>

      <div className="post-list">
        <h2>Recent Blog Posts</h2>
        <div id="posts-container">
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div className="post-card" key={post._id}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className="meta">By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</div>
                <button
                  className="edit-btn"
                  onClick={() => editPost(post._id, post.title, post.content)}
                >
                  Edit Post
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deletePost(post._id)}
                >
                  Delete Post
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
