import { useState } from "react";
import { useRouter } from 'next/router';


export default function AIAgent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [groupedProducts, setGroupedProducts] = useState([]);

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

  const flatProducts = groupedProducts.flat(); // because AI response is in nested array format
  const productNames = flatProducts.map(item => item.name || item.productName);

  console.log("🧭 Finding path for:", productNames);

  // Store both for map use
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

  const flatProducts = groupedProducts.flat();
  const totalCost = flatProducts.reduce(
    (sum, p) => sum + (p.totalPrice || 0),
    0
  );

  return (
    <div className="walmart-bg">
      <header className="walmart-header-blue">
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
    </div>
  );
}
