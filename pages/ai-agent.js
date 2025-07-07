import { useState } from "react";
import { useRouter } from 'next/router';

export default function AIAgent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [alternativesModal, setAlternativesModal] = useState({
    show: false,
    productIndex: null,
    alternatives: [],
    loading: false
  });

  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, matrix: groupedProducts }),
      });

      if (!res.ok) {
        let msg = `AI request failed: ${res.status}`;
        try {
          const json = await res.json();
          msg += json?.error ? ` — ${json.error}` : " — Unexpected error";
        } catch {
          msg += " — Failed to parse error JSON";
        }
        throw new Error(msg);
      }

      const data = await res.json();
      setGroupedProducts(Array.isArray(data.matrix) ? data.matrix : []);
    } catch (err) {
      console.error("Full error:", err);
      setError("Sorry, something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleFindPath = (groupedProducts) => {
    if (!groupedProducts || groupedProducts.length === 0) {
      alert("🛒 Your cart is empty. Add items first.");
      return;
    }

    const flatProducts = groupedProducts.flat();
    const productNames = flatProducts.map(item => item.name || item.productName);

    console.log("🧭 Finding path for:", productNames);

    localStorage.setItem("pathProducts", JSON.stringify(productNames));
    localStorage.setItem("pathProductsDetails", JSON.stringify(flatProducts));

    alert("📍 Path request stored! Opening map...");
    router.push("/map");
  };

  function handleDelete(indexToRemove) {
    const newGrouped = groupedProducts
      .flat()
      .filter((_, index) => index !== indexToRemove);

    const reGrouped = newGrouped.map(item => [item]);
    setGroupedProducts(reGrouped);
  }

  async function showAlternatives(productIndex) {
  const product = groupedProducts.flat()[productIndex];
  if (!product) return;

  // Log original name for debugging
  console.log("Original product name:", product.name);

  // Clean the name: lowercase and remove special characters
  const cleanedName = product.name
    .toLowerCase() // Convert to lowercase
    .replace(/[-_/\\[\]]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing spaces

  // Log cleaned name for debugging
  console.log("Cleaned product name:", cleanedName);

  setAlternativesModal({
    ...alternativesModal,
    show: true,
    productIndex,
    loading: true,
    alternatives: []
  });

  try {
    // Make request with cleaned name
    console.log("Making request with name:", cleanedName);
    const res = await fetch(`http://localhost:5000/api/search?name=${encodeURIComponent(cleanedName)}`);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch alternatives');
    }
    
    const data = await res.json();
    console.log("Search results:", data);
    
    setAlternativesModal({
      ...alternativesModal,
      show: true,
      productIndex,
      loading: false,
      alternatives: data.products.filter(p => p._id !== product._id)
    });
  } catch (err) {
    console.error("Error fetching alternatives:", err);
    setAlternativesModal({
      ...alternativesModal,
      loading: false,
      alternatives: [],
      error: err.message
    });
  }
}

  function handleSwap(alternativeProduct) {
    if (alternativesModal.productIndex === null) return;

    const flatProducts = groupedProducts.flat();
    flatProducts[alternativesModal.productIndex] = alternativeProduct;

    // Regroup the products
    const reGrouped = flatProducts.map(item => [item]);
    setGroupedProducts(reGrouped);
    setAlternativesModal({ ...alternativesModal, show: false });
  }

  function handleAddToCart(alternativeProduct) {
    const newProduct = [alternativeProduct];
    setGroupedProducts([...groupedProducts, newProduct]);
    setAlternativesModal({ ...alternativesModal, show: false });
  }

  const flatProducts = groupedProducts.flat();
  const totalCost = flatProducts.reduce(
    (sum, p) => sum + (p.totalPrice || 0),
    0
  );

  return (
    <div className="walmart-bg">
      <style jsx>{`
        .alternatives-btn {
          background: #f0f0f0;
          color: #0071dc;
          border: 1px solid #0071dc;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          transition: all 0.2s;
        }
        
        .alternatives-btn:hover {
          background: #0071dc;
          color: white;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 80%;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          padding: 20px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          background: none;
          border: none;
        }
        
        .modal-close:hover {
          color: #000;
        }
        
        .modal-title {
          color: #0071dc;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: bold;
        }
        
        .alternatives-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .alternative-product {
          border: 1px solid #e6e6e6;
          border-radius: 8px;
          padding: 15px;
          transition: transform 0.2s;
        }
        
        .alternative-product:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .alternative-product img {
          width: 100%;
          height: 150px;
          object-fit: contain;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .alternative-name {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }
        
        .alternative-price {
          color: #e63946;
          font-weight: bold;
          margin: 8px 0;
        }
        
        .alternative-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .swap-btn {
          background: #0071dc;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          flex: 1;
          font-size: 14px;
        }
        
        .swap-btn:hover {
          background: #005bb5;
        }
        
        .add-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          flex: 1;
          font-size: 14px;
        }
        
        .add-btn:hover {
          background: #218838;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 113, 220, 0.3);
          border-radius: 50%;
          border-top-color: #0071dc;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .no-alternatives {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>

      <header className="walmart-header-blue">
        {/* ... existing header code ... */}
        <div className="walmart-header-content">
          <div className="walmart-header-logo">
            <img src="/walmart-spark.svg" alt="Walmart Logo" className="walmart-spark-img" />
            <span className="walmart-logo-text-white">Walmart</span>
          </div>
          
          {/* Search bar with AI agent button */}
          <div className="walmart-search-container">
            <form className="walmart-searchbar" onSubmit={handleSubmit}>
              <input
                className="walmart-searchbar-input"
                type="text"
                placeholder="What are you looking for?"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                required
              />
              <button className="walmart-search-btn" type="submit" disabled={loading}>
                <svg className="walmart-search-icon" viewBox="0 0 24 24" fill="none">
                  <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
            <a href="/ai-agent" className="walmart-ai-button" title="AI Smart Shopper">
              <img src="/walmart-ai-energetic.svg" alt="AI Assistant" className="walmart-ai-icon-img" />
            </a>
          </div>

          <nav className="walmart-nav">
            <a href="/products" className="walmart-btn-white">Browse Products</a>
            <a href="/cart" className="walmart-btn-white">
              <svg className="walmart-cart-svg-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6M9 19.5h.01M20 19.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cart
            </a>
          </nav>
        </div>
      </header>

      <main className="walmart-ai-main-top">
        <div className="walmart-ai-hero">
          <div className="walmart-ai-hero-content">
           {flatProducts.length === 0 && (
              <>
                <h1 className="walmart-ai-title">AI Smart Shopper</h1>
                <p className="walmart-ai-desc">
                  Describe your shopping need or recipe. The AI will suggest
                  Walmart products, brands, and alternatives instantly!
                </p>
              </>
            )}
            {flatProducts.length > 0 && (
  <section className="cart-section">
    <h2 className="cart-title">🛒 Your Smart Shopping List</h2>

    <div className="cart-grid">
      {flatProducts.map((product, index) => (
        <div key={index} className="cart-product-card">
          <div className="cart-product-header">
            <h3 className="cart-product-name">{product.name}</h3>
            <button
              className="cart-delete-btn"
              onClick={() => handleDelete(index)}
              title="Remove product"
            >
              ❌
            </button>
          </div>
          <p className="cart-meta">
            <strong>Category:</strong> {product.category || "N/A"}
          </p>
          <p className="cart-meta">
            <strong>Quantity:</strong> {product.quantity || "—"}
          </p>
          <p className="cart-meta">
            <strong>Required Count:</strong> {product.requiredCount || 1}
          </p>
          <button 
                        className="alternatives-btn"
                        onClick={() => showAlternatives(index)}
                      >
                        🔄 Alternatives & Similar
                      </button>
          <p className="cart-meta">
            <strong>Price:</strong> ₹{product.price || product.totalPrice || 0}
          </p>
          <p className="cart-meta">
            <strong>Ingredient(s):</strong>{" "}
            {product.ingredientSources
              ?.map((src) => `${src.name} (${src.quantity})`)
              .join(", ")}
          </p>
          {product.totalPrice &&
            product.price &&
            product.requiredCount && (
              <p className="cart-subtotal">
                <strong>Subtotal:</strong> {product.requiredCount} × ₹
                {product.price} = ₹{product.totalPrice}
              </p>
            )}
        </div>
      ))}
    </div>

    <div className="cart-footer">
      <h2 className="cart-total">
        💰 <span>Total Estimated Budget:</span> ₹{totalCost}
      </h2>
      <button className="cart-add-btn">🛍️ Add List to Cart</button>

      <button
    className="cart-path-btn"
    onClick={() => handleFindPath(groupedProducts)}
    style={{ marginTop: '10px', backgroundColor: '#28a745', color: '#fff', padding: '8px 12px', borderRadius: '5px' }}
  >
    🧭 Find Path on Map
  </button>

    </div>
  </section>
)}


            {/* ... existing form code ... */}
              <form className="walmart-ai-form-top" onSubmit={handleSubmit}>
              <div className="walmart-ai-input-container">
                <input
                  className="walmart-ai-input"
                  type="text"
                  placeholder="e.g. pasta dinner for 4, cleaning supplies for kitchen"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  className="walmart-ai-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="walmart-loading">⏳ Loading...</span>
                  ) : (
                    <span>✨ Get Suggestions</span>
                  )}
                </button>
              </div>
              {error && <div className="walmart-ai-error">{error}</div>}
            </form>
          
          </div>
        </div>
      </main>

      {alternativesModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => setAlternativesModal({ ...alternativesModal, show: false })}
            >
              ×
            </button>
            <h2 className="modal-title">Alternative Products</h2>
            
            {alternativesModal.loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="loading-spinner"></div>
                <p>Finding alternatives...</p>
              </div>
            ) : alternativesModal.alternatives.length === 0 ? (
              <div className="no-alternatives">
                No alternative products found
              </div>
            ) : (
              <div className="alternatives-grid">
                {alternativesModal.alternatives.map((product) => (
                  <div key={product._id} className="alternative-product">
                    
                    <h3 className="alternative-name">{product.name}</h3>
                    <p className="cart-meta">
                      <strong>Category:</strong> {product.category || "N/A"}
                    </p>
                    <p className="cart-meta">
                      <strong>Quantity:</strong> {product.quantity || "—"}
                    </p>
                    <p className="alternative-price">₹{product.price}</p>
                    <div className="alternative-actions">
                      <button 
                        className="swap-btn"
                        onClick={() => handleSwap(product)}
                      >
                        Swap
                      </button>
                      <button 
                        className="add-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}