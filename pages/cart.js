import { useEffect, useState } from "react";
import CartSummary from "../components/CartSummary";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("");

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const parsedCart = JSON.parse(cart);
      // Ensure all items have quantity
      const itemsWithQuantity = parsedCart.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      setItems(itemsWithQuantity);
    }
  }, []);

  function handleRemoveItem(index) {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  }

  function handleUpdateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
      handleRemoveItem(index);
      return;
    }
    
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  }

  function handleClearCart() {
    setItems([]);
    localStorage.removeItem("cart");
  }

  return (
    <div className="walmart-bg">
      <header className="walmart-header-blue">
        <div className="walmart-header-logo">
          <img src="/walmart-logo.png" alt="Walmart Logo" className="walmart-logo-img" />
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
        </nav>
      </header>
      
      <main className="walmart-main">
        <div className="walmart-main-grid">
          {/* Cart Summary (left 2/3) */}
          <div className="walmart-cart-col">
            <div className="walmart-card walmart-cart-card">
              <div className="walmart-cart-header">
                <h2 className="walmart-cart-title">
                  <span className="walmart-cart-icon">🛒</span> Your Cart
                </h2>
                {items && items.length > 0 && (
                  <button 
                    className="walmart-btn-outline walmart-clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </button>
                )}
              </div>
              
              <CartSummary 
                items={items} 
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
              
              {(!items || items.length === 0) && (
                <div className="walmart-cart-empty">
                  <span className="walmart-cart-empty-icon">🛍️</span>
                  <h3>Your cart is empty</h3>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <div className="walmart-cart-empty-actions">
                    <a href="/products" className="walmart-btn-primary">Start Shopping</a>
                    <a href="/ai-agent" className="walmart-btn-secondary">Get AI Suggestions</a>
                  </div>
                </div>
              )}
              
              {items && items.length > 0 && (
                <div className="walmart-cart-mode">
                  <div className="walmart-cart-mode-title">
                    <span className="walmart-cart-mode-icon">🛍️</span> How would you like to shop?
                  </div>
                  <div className="walmart-cart-mode-btns">
                    <button
                      className={`walmart-btn-outline ${mode === 'online' ? 'walmart-btn-primary-active' : ''}`}
                      onClick={() => setMode('online')}
                    >
                      <span className="walmart-cart-mode-btn-icon">💻</span> Buy Online
                    </button>
                    <button
                      className={`walmart-btn-outline walmart-btn-yellow ${mode === 'instore' ? 'walmart-btn-yellow-active' : ''}`}
                      onClick={() => setMode('instore')}
                    >
                      <span className="walmart-cart-mode-btn-icon">🏬</span> Shop In-Store
                    </button>
                  </div>
                  {mode === 'online' && (
                    <div className="walmart-cart-online-msg">
                      <span>🛒</span> Proceed to online checkout (feature coming soon)
                    </div>
                  )}
                  {mode === 'instore' && (
                    <a href="/map" className="walmart-btn-primary walmart-cart-map-btn">
                      <span>🗺️</span> Go to Store Map
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Info Card (right column) */}
          <div className="walmart-info-col">
            <div className="walmart-card walmart-info-card">
              <span className="walmart-info-title"><span>💡</span> Cart Tips</span>
              <ul className="walmart-info-list">
                <li>Review your items before checkout</li>
                <li>Adjust quantities using + and - buttons</li>
                <li>Choose your preferred shopping mode</li>
                <li>Use the store map for in-store shopping</li>
              </ul>
            </div>
            <div className="walmart-card walmart-help-card">
              <span className="walmart-help-title"><span>🤖</span> Need help?</span>
              <p className="walmart-help-text">Try our <a href="/ai-agent" className="walmart-link">AI Agent</a> for smart product suggestions!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
