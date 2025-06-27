import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

// Walmart-style static product suggestions page
export default function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const aiProducts = sessionStorage.getItem("aiProducts");
    if (aiProducts) setProducts(JSON.parse(aiProducts));
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  function handleAddToCart(product) {
    // Check if product is already in cart
    const existingItem = cart.find((c) => c.name === product.name && c.brand === product.brand);
    
    if (!existingItem) {
      const newItem = { ...product, quantity: 1 };
      const updatedCart = [...cart, newItem];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      
      // Remove product from products list (edge case fix)
      setProducts((prev) => prev.filter((p) => !(p.name === product.name && p.brand === product.brand)));
    }
  }

  function handleAddAllToCart() {
    // Only add valid products (with name and numeric price)
    const validProducts = products.filter(
      (p) => p && typeof p.name === "string" && typeof p.price === "number"
    );
    
    const newItems = validProducts.filter(
      (p) => !cart.some((c) => c.name === p.name && c.brand === p.brand)
    ).map(p => ({ ...p, quantity: 1 }));
    
    const updatedCart = [...cart, ...newItems];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    // Clear all products from the list since they're all added
    setProducts([]);
  }

  function handleRemoveFromProducts(idx) {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleBrandSwap(idx, altIdx) {
    setProducts((prev) => {
      const updated = [...prev];
      const alt = updated[idx].alternatives[altIdx];
      updated[idx] = { ...updated[idx], ...alt };
      return updated;
    });
  }

  return (
    <div className="walmart-bg">
      {/* Walmart-style header */}
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
          <a href="/cart" className="walmart-btn-white walmart-cart-btn">
            <span className="walmart-cart-icon">🛒</span>
            Cart
            {cart.length > 0 && (
              <span className="walmart-cart-badge">{cart.length}</span>
            )}
          </a>
        </nav>
      </header>

      {/* Main content */}
      <main className="walmart-products-main">
        <div className="walmart-products-header">
          <h1 className="walmart-products-title">🛍️ Product Suggestions</h1>
          {products.length > 0 && (
            <button className="walmart-btn-yellow" onClick={handleAddAllToCart}>
              Add All to Cart ({products.length} items)
            </button>
          )}
        </div>
        
        <div className="walmart-products-list">
          {products.length === 0 && (
            <div className="walmart-card walmart-products-empty">
              <div className="walmart-empty-state">
                <span className="walmart-empty-icon">📦</span>
                <h3>No products to show</h3>
                <p>All products have been added to your cart, or try getting new suggestions from the AI Agent!</p>
                <div className="walmart-empty-actions">
                  <a href="/ai-agent" className="walmart-btn-primary">
                    🤖 Get AI Suggestions
                  </a>
                  <a href="/cart" className="walmart-btn-secondary">
                    🛒 View Cart
                  </a>
                </div>
              </div>
            </div>
          )}
          {products.map((product, idx) => (
            <ProductCard
              key={`${product.name}-${product.brand}-${idx}`}
              product={product}
              onRemove={() => handleRemoveFromProducts(idx)}
              onBrandSwap={(altIdx) => handleBrandSwap(idx, altIdx)}
              onAddToCart={() => handleAddToCart(product)}
              inCart={cart.some((c) => c.name === product.name && c.brand === product.brand)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
