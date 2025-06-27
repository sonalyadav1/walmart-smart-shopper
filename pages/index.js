import { useState } from "react";
import { useRouter } from "next/router";

const STRUCTURED_PROMPT_PREFIX =
  "Return a JSON array of Walmart-style grocery products for the following shopping need. Each product should have: name, aisle, price, brand, and alternatives (an array of objects with name, price, brand). Do not include any text or explanation, only the JSON array. Shopping need: ";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function extractJsonArray(text) {
    const match = text.match(/\[.*\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gemini-cli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: STRUCTURED_PROMPT_PREFIX + input })
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      let products = extractJsonArray(data.result);
      if (!products) {
        products = [{ name: data.result }];
      }
      sessionStorage.setItem("aiProducts", JSON.stringify(products));
      router.push("/products");
    } catch (err) {
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
      
      <main className="walmart-home-main-compact">
        {error && <div className="walmart-ai-error">{error}</div>}
        
        <div className="walmart-hero-section">
          <div className="walmart-hero-content">
            <h1 className="walmart-hero-title">Save money. Live better.</h1>
            <p className="walmart-hero-subtitle">Get smart product suggestions with our AI-powered shopping assistant</p>
            <div className="walmart-hero-buttons">
              <a href="/ai-agent" className="walmart-btn-yellow walmart-hero-btn">
                Try AI Shopping Assistant
              </a>
              <a href="/products" className="walmart-btn-white walmart-hero-btn">
                Browse Products
              </a>
            </div>
          </div>
        </div>
        
        <div className="walmart-home-grid-compact">
          <div className="walmart-home-features">
            <div className="walmart-feature-card">
              <div className="walmart-feature-icon">
                <img src="/walmart-ai-energetic.svg" alt="AI Assistant" className="walmart-feature-ai-icon" />
              </div>
              <h3 className="walmart-feature-title">AI Smart Shopping</h3>
              <p className="walmart-feature-desc">Get personalized product recommendations based on your needs</p>
            </div>
            <div className="walmart-feature-card">
              <div className="walmart-feature-icon">
                <svg className="walmart-feature-svg-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#0071ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="#0071ce" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="walmart-feature-title">Store Navigation</h3>
              <p className="walmart-feature-desc">Find products easily with our interactive store map</p>
            </div>
            <div className="walmart-feature-card">
              <div className="walmart-feature-icon">
                <svg className="walmart-feature-svg-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20m-8-8h16" stroke="#0071ce" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 6h12v12H6z" stroke="#0071ce" strokeWidth="2" fill="#f9f9f9"/>
                  <path d="M9 9h6M9 12h6M9 15h6" stroke="#0071ce" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="walmart-feature-title">Best Prices</h3>
              <p className="walmart-feature-desc">Compare brands and find the best deals automatically</p>
            </div>
          </div>
          
          <div className="walmart-home-right-col">
            <div className="walmart-card walmart-home-card">
              <span className="walmart-home-card-title">Hot new arrivals</span>
              <img src="https://i5.walmartimages.com/dfw/4ff9c6c9-2b7e/k2-_b6e2e7e2-2e2e-4e2e-8e2e-2e2e2e2e2e2e.v1.jpg" alt="Hot new arrivals" className="walmart-home-card-img" />
              <a href="/products" className="walmart-link">Shop now</a>
            </div>
            <div className="walmart-card walmart-home-card">
              <span className="walmart-home-card-title">Up to 55% off</span>
              <img src="https://i5.walmartimages.com/dfw/4ff9c6c9-2b7e/k2-_b6e2e7e2-2e2e-4e2e-8e2e-2e2e2e2e2e2e.v1.jpg" alt="Up to 55% off" className="walmart-home-card-img" />
              <a href="/products" className="walmart-link">Shop now</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
