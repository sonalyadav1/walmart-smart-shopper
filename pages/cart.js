import { useEffect, useState } from "react";
import CartSummary from "../components/CartSummary";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("");

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) setItems(JSON.parse(cart));
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fa]">
      <header className="header-walmart py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Walmart-Logo-2012.png" alt="Walmart Logo" className="h-8 w-auto" />
          <span className="text-[#0071dc] font-bold text-2xl tracking-tight">Walmart</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/ai-agent" className="btn-walmart px-6 py-2">Try AI Agent</a>
          <a href="/products" className="bg-[#0071dc] hover:bg-[#005cb2] text-white font-bold px-6 py-2 rounded-full shadow border border-[#0071dc] transition-colors duration-150">Products</a>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-3xl font-bold text-[#0071dc] mb-6 text-center">Your Cart</h2>
        <div className="w-full max-w-md">
          <CartSummary items={items} />
          {(!items || items.length === 0) && (
            <div className="text-center text-gray-500 mt-6 text-lg bg-white rounded-xl p-6 shadow border border-gray-100">
              Your cart is empty. Go to <a href="/products" className="text-[#0071dc] underline font-semibold">Products</a> to add items.
            </div>
          )}
        </div>
        {items && items.length > 0 && (
          <div className="mt-10 bg-white rounded-xl shadow border border-gray-100 p-6 w-full max-w-md flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-[#0071dc]">How would you like to shop?</div>
            <div className="flex gap-4 mb-2">
              <button
                className={`px-6 py-3 rounded-full font-bold border transition-colors duration-150 ${mode === 'online' ? 'bg-[#0071dc] text-white border-[#0071dc]' : 'bg-[#f6f7fa] text-[#0071dc] border-[#0071dc] hover:bg-[#e6f1fb]'}`}
                onClick={() => setMode('online')}
              >
                Buy Online
              </button>
              <button
                className={`px-6 py-3 rounded-full font-bold border transition-colors duration-150 ${mode === 'instore' ? 'bg-[#ffc220] text-[#0071dc] border-[#ffc220]' : 'bg-[#f6f7fa] text-[#0071dc] border-[#ffc220] hover:bg-[#fff7d6]'}`}
                onClick={() => setMode('instore')}
              >
                Shop In-Store
              </button>
            </div>
            {mode === 'online' && (
              <div className="mt-4 text-green-700 font-semibold">Proceed to online checkout (feature coming soon)</div>
            )}
            {mode === 'instore' && (
              <a href="/map" className="mt-6 bg-[#0071dc] hover:bg-[#005cb2] text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors duration-200 text-lg">Go to Store Map</a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
