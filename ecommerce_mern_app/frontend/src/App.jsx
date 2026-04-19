import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api';
const fmt = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [localQtys, setLocalQtys] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
      const qtys = {};
      data.forEach(p => qtys[p._id] = 1);
      setLocalQtys(qtys);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  };

  const updateLocalQty = (id, delta) => {
    setLocalQtys(prev => {
      let val = (prev[id] || 1) + delta;
      if (val < 1) val = 1;
      return { ...prev, [id]: val };
    });
  };

  const addToCart = async (product) => {
    const qty = localQtys[product._id] || 1;
    try {
      await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, quantity: qty })
      });
      showToast(`${product.name} added to your selection`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id) => {
    try {
      await fetch(`${API_URL}/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 0 })
      });
      showToast('Item removed from selection');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('Your selection is empty');
      return;
    }
    try {
      await fetch(`${API_URL}/cart`, { method: 'DELETE' });
      showToast('Order placed — thank you for your selection');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToCart = () => {
    document.getElementById('cart-sidebar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartValue = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = totalCartValue > 50000 ? 0 : (totalCartValue > 0 ? 199 : 0);

  return (
    <>
      <header>
        <div className="logo">Nex<span>us</span></div>
        <div className="header-right">
          <button className="cart-trigger" onClick={scrollToCart}>
            <span>Cart</span>
            <span className="cart-badge">{totalCartItems}</span>
          </button>
        </div>
      </header>

      <div className="hero-band">
        <p className="hero-eyebrow">New Season · 2025 Collection</p>
        <h1 className="hero-title">Objects of <em>lasting</em> desire</h1>
      </div>

      <div className="layout">
        {/* Products */}
        <div className="products-section">
          <div className="section-header">
            <h2 className="section-label">Featured Collection</h2>
            <span className="section-count">{products.length} items</span>
          </div>
          <div className="product-grid">
            {products.map(p => (
              <div className="product-card" key={p._id}>
                <div className="img-wrap">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <span className="category-tag">{p.category || 'Curated'}</span>
                </div>
                <div className="card-body">
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">{fmt(p.price)}</div>
                </div>
                <div className="card-footer">
                  <div className="qty-row">
                    <span className="qty-label">Qty</span>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateLocalQty(p._id, -1)}>−</button>
                      <span className="qty-val">{localQtys[p._id] || 1}</span>
                      <button className="qty-btn" onClick={() => updateLocalQty(p._id, 1)}>+</button>
                    </div>
                  </div>
                  <button className="add-btn" onClick={() => addToCart(p)}>Add to Selection</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <aside className="cart-sidebar" id="cart-sidebar">
          <div className="cart-header">
            <h2 className="cart-title">Your Selection</h2>
            <p className="cart-subtitle">
              {cartItems.length > 0 
                ? `${cartItems.length} piece${cartItems.length > 1 ? 's' : ''} · ${totalCartItems} unit${totalCartItems > 1 ? 's' : ''}`
                : 'Nothing selected yet'}
            </p>
          </div>
          <div className="cart-items-wrap">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">◻</div>
                <p>Your selection is empty.<br />Add pieces to begin.</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div className="cart-item" key={item._id}>
                  <img className="ci-img" src={item.image} alt={item.name} />
                  <div className="ci-info">
                    <div className="ci-name">{item.name}</div>
                    <div className="ci-meta">
                      <span className="ci-qty-price">{item.quantity} × {fmt(item.price)}</span>
                      <span className="ci-total">{fmt(item.price * item.quantity)}</span>
                    </div>
                    <button className="ci-remove" onClick={() => removeItem(item._id)}>Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cart-footer">
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{fmt(totalCartValue)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 && totalCartValue > 0 ? 'Free' : (shipping > 0 ? fmt(shipping) : 'Calculated at checkout')}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span className="total-amount">{fmt(totalCartValue + shipping)}</span>
              </div>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>Complete Order →</button>
          </div>
        </aside>
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast">{toastMsg}</div>
    </>
  );
}

export default App;
