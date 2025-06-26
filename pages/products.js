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

  function handleAddAllToCart() {
    // Only add valid products (with name and numeric price)
    const validProducts = products.filter(
      (p) => p && typeof p.name === "string" && typeof p.price === "number"
    );
    const newItems = validProducts.filter(
      (p) => !cart.some((c) => c.name === p.name && c.brand === p.brand)
    );
    const updated = [...cart, ...newItems];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
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
    <div className="min-h-screen bg-[#f6f7fa]">
      {/* Walmart-style header */}
      <header className="header-walmart py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Walmart-Logo-2012.png" alt="Walmart Logo" className="h-8 w-auto" />
          <span className="text-[#0071dc] font-bold text-2xl tracking-tight">Walmart</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/ai-agent" className="btn-walmart px-6 py-2">Try AI Agent</a>
          <a href="/cart" className="bg-[#0071dc] hover:bg-[#005cb2] text-white font-bold px-6 py-2 rounded-full shadow border border-[#0071dc] transition-colors duration-150">
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ffc220] text-[#0071dc] rounded-full px-2 py-0.5 text-xs font-bold border border-white">{cart.length}</span>
            )}
          </a>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center py-12 px-2">
        <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-[#0071dc] mb-8 text-center tracking-tight">
            Product Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product, idx) => (
              <ProductCard
                key={idx}
                product={product}
                onRemove={() => handleRemoveFromProducts(idx)}
                onBrandSwap={(altIdx) => handleBrandSwap(idx, altIdx)}
              />
            ))}
          </div>
          {products.length > 0 && (
            <button
              className="mt-10 w-full max-w-md mx-auto btn-walmart px-8 py-4 text-xl block"
              onClick={handleAddAllToCart}
              disabled={products.every((p) => cart.some((c) => c.name === p.name && c.brand === p.brand))}
            >
              Add All to Cart
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
