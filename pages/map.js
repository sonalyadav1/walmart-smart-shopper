import { useEffect, useState } from "react";
import MapOverlay from "../components/MapOverlay";

export default function Map() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) setItems(JSON.parse(cart));
  }, []);

  return (
    <div className="walmart-bg">
      <header className="walmart-header-blue">
        <div className="walmart-header-logo">
          <img
            src="/walmart-logo.png"
            alt="Walmart Logo"
            className="walmart-logo-img"
          />
          <span className="walmart-logo-text-white">Walmart</span>
        </div>
        
        {/* Search bar with AI agent button */}
        <div className="walmart-search-container">
          <form className="walmart-searchbar" onSubmit={(e) => { e.preventDefault(); }}>
            <input
              className="walmart-searchbar-input"
              type="text"
              placeholder="What are you looking for?"
            />
            <button className="walmart-search-btn" type="submit">
              <svg className="walmart-search-icon" viewBox="0 0 24 24" fill="none">
                <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          <a href="/ai-agent" className="walmart-ai-button" title="AI Smart Shopper">
            <span className="walmart-ai-icon">🤖</span>
          </a>
        </div>

        <nav className="walmart-nav">
          <a href="/products" className="walmart-btn-white">Products</a>
          <a href="/cart" className="walmart-btn-white">
            <span className="walmart-cart-icon">🛒</span>
            Cart
          </a>
        </nav>
      </header>
      <main className="walmart-map-main">
        <div className="walmart-map-grid">
          {/* Store Map & Path (left 2/3) */}
          <div className="walmart-map-col">
            <div className="walmart-card walmart-map-card">
              <h2 className="walmart-map-title">
                <span className="walmart-map-icon">🗺️</span> Store Map & Optimized Path
              </h2>
              <div className="walmart-map-stats">
                <div className="walmart-stat">
                  <span className="walmart-stat-number">{items.length}</span>
                  <span className="walmart-stat-label">Items to collect</span>
                </div>
                <div className="walmart-stat">
                  <span className="walmart-stat-number">{new Set(items.map(item => item.aisle)).size}</span>
                  <span className="walmart-stat-label">Aisles to visit</span>
                </div>
              </div>
              <div className="walmart-map-overlay">
                <MapOverlay path={items} />
              </div>
            </div>
          </div>
          {/* Info Card (right column) */}
          <div className="walmart-info-col">
            <div className="walmart-card walmart-info-card">
              <span className="walmart-info-title"><span>💡</span> In-Store Shopping Tips</span>
              <ul className="walmart-info-list">
                <li>🚶‍♂️ Follow the blue path for optimal route</li>
                <li>📍 Red dots show your item locations</li>
                <li>🛒 Check off items as you collect them</li>
                <li>⬅️ Use back button to modify your cart</li>
              </ul>
            </div>
            <div className="walmart-card walmart-help-card">
              <span className="walmart-help-title"><span>🤖</span> Need more items?</span>
              <p className="walmart-help-text">Use our <a href="/ai-agent" className="walmart-link">AI Agent</a> to find additional products or get suggestions for missing items!</p>
              <div className="walmart-help-actions">
                <a href="/ai-agent" className="walmart-btn-secondary">Add More Items</a>
                <a href="/cart" className="walmart-btn-outline">Back to Cart</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
