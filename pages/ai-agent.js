import { useState } from "react";
import { useRouter } from "next/router";

const STRUCTURED_PROMPT_PREFIX =
  "Return a JSON array of Walmart-style grocery products for the following shopping need. Each product should have: name, aisle, price, brand, and alternatives (an array of objects with name, price, brand). Do not include any text or explanation, only the JSON array. Shopping need: ";

export default function AIAgent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Making request to backend...");
      const res = await fetch("http://localhost:3000/api/generate-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Response error:", errorText);
        throw new Error(`AI request failed: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Response data:", data);
      let products = data.products;
      if (!products) {
        products = [];
      }
      sessionStorage.setItem("aiProducts", JSON.stringify(products));
      router.push("/products");
    } catch (err) {
      console.error("Full error:", err);
      setError("Sorry, something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

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
            <form className="walmart-searchbar" onSubmit={(e) => { e.preventDefault(); router.push('/products'); }}>
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
            <div className="walmart-ai-button walmart-ai-active" title="AI Smart Shopper">
              <img src="/walmart-ai-energetic.svg" alt="AI Assistant" className="walmart-ai-icon-img" />
            </div>
          </div>

          <nav className="walmart-nav">
            <a href="/products" className="walmart-btn-white">Products</a>
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
            <h1 className="walmart-ai-title">AI Smart Shopper</h1>
            <p className="walmart-ai-desc">Describe your shopping need or recipe. The AI will suggest Walmart products, brands, and alternatives instantly!</p>
            
            <form className="walmart-ai-form-top" onSubmit={handleSubmit}>
              <div className="walmart-ai-input-container">
                <input
                  className="walmart-ai-input"
                  type="text"
                  placeholder="e.g. pasta dinner for 4, cleaning supplies for kitchen"
                  value={input}
                  onChange={e => setInput(e.target.value)}
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
        
        <section className="walmart-ai-info">
          <div className="walmart-ai-info-grid">
            <div className="walmart-card walmart-ai-how">
              <span className="walmart-info-title"><span>💡</span> How it works</span>
              <ul className="walmart-info-list">
                <li>🗣️ Describe what you need in natural language</li>
                <li>AI analyzes your request and finds products</li>
                <li>🏷️ Get suggestions with brands and alternatives</li>
                <li>🛒 Add items to cart and shop efficiently</li>
              </ul>
            </div>
            
            <div className="walmart-card walmart-ai-inspiration">
              <span className="walmart-info-title"><span>✨</span> Example queries</span>
              <div className="walmart-example-queries">
                <button className="walmart-example-btn" onClick={() => setInput("ingredients for white sauce pasta")}>
                  🍝 White sauce pasta ingredients
                </button>
                <button className="walmart-example-btn" onClick={() => setInput("cleaning supplies for kitchen")}>
                  🧽 Kitchen cleaning supplies
                </button>
                <button className="walmart-example-btn" onClick={() => setInput("healthy breakfast options")}>
                  🥗 Healthy breakfast options
                </button>
                <button className="walmart-example-btn" onClick={() => setInput("baking ingredients for chocolate cake")}>
                  🍰 Chocolate cake baking supplies
                </button>
              </div>
            </div>
            
            <div className="walmart-card walmart-ai-tips">
              <span className="walmart-info-title"><span>🎯</span> Pro Tips</span>
              <ul className="walmart-info-list">
                <li>Be specific about quantities (e.g., "for 4 people")</li>
                <li>Mention dietary preferences or restrictions</li>
                <li>Include the occasion or purpose</li>
                <li>Ask for alternatives to compare options</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
