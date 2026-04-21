import { useState, useEffect } from 'react';
import './index.css';

const API_URL = '/api';
const fmt = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState('shop'); // 'shop' or 'orders'
  const [toastMsg, setToastMsg] = useState('');
  const [localQtys, setLocalQtys] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
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
      const res = await fetch(`${API_URL}/checkout`, { method: 'POST' });
      if (res.ok) {
        showToast('Order placed — view it anytime from My Orders');
        fetchCart();
        fetchOrders();
      } else {
        const error = await res.json();
        showToast(error.message || 'Checkout failed');
      }
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
        <div className="logo" onClick={() => setActiveView('shop')} style={{ cursor: 'pointer' }}>Nex<span>us</span></div>
        <div className="header-right">
          <button
            className={`nav-link ${activeView === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveView('shop')}
          >
            Shop
          </button>
          <button
            className={`nav-link ${activeView === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveView('orders')}
          >
            My Orders
          </button>
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
        {/* Main Content */}
        <div className="main-content">
          {activeView === 'shop' ? (
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
          ) : (
            <div className="orders-section">
              <div className="section-header">
                <h2 className="section-label">Order History</h2>
                <div className="section-header-right">
                  <span className="section-count">{orders.length} orders total</span>
                  <button className="continue-shopping-btn" onClick={() => setActiveView('shop')}>
                    ← Continue Shopping
                  </button>
                </div>
              </div>
              <div className="orders-list">
                {orders.length === 0 ? (
                  <div className="orders-empty">
                    <p>No past orders found.</p>
                    <button className="shop-now-btn" onClick={() => setActiveView('shop')}>Shop our Collection</button>
                  </div>
                ) : (
                  orders.map(order => {
                    const itemCount = order.items.reduce((a, i) => a + i.quantity, 0);
                    const orderDate = new Date(order.orderedAt);
                    return (
                      <div className="order-card" key={order._id}>
                        <div className="order-card-header">
                          <div className="order-header-left">
                            <div className="order-id">Order #<span>{order._id.slice(-8).toUpperCase()}</span></div>
                            <div className="order-date">
                              Placed on {orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                              {' · '}
                              {itemCount} item{itemCount > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className={`order-status status-${(order.status || 'Confirmed').toLowerCase()}`}>
                            ● {order.status || 'Confirmed'}
                          </div>
                        </div>
                        <div className="order-items">
                          {order.items.map((item, idx) => (
                            <div className="order-item-row" key={idx}>
                              <div className="order-item-img-wrap">
                                {item.image
                                  ? <img className="order-item-img" src={item.image} alt={item.name} />
                                  : <div className="order-item-img placeholder">◻</div>}
                              </div>
                              <div className="order-item-details">
                                <div className="item-name">{item.name}</div>
                                <div className="item-sub">
                                  <span className="item-unit-price">{fmt(item.price)}</span>
                                  <span className="item-qty">Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="item-line-total">{fmt(item.price * item.quantity)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="order-card-footer">
                          <div className="order-totals">
                            {order.subtotal != null && (
                              <div className="order-total-row">
                                <span>Subtotal</span>
                                <span>{fmt(order.subtotal)}</span>
                              </div>
                            )}
                            {order.shipping != null && (
                              <div className="order-total-row">
                                <span>Shipping</span>
                                <span>{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span>
                              </div>
                            )}
                            <div className="order-total-row grand">
                              <span>Grand Total</span>
                              <span className="order-total-val">{fmt(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
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
