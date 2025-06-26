import { useEffect, useState } from "react";
import MapOverlay from "../components/MapOverlay";

export default function Map() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const cart = localStorage.getItem("cart");
    if (cart) setItems(JSON.parse(cart));
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fa]">
      <header className="bg-white shadow-md py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://1000logos.net/wp-content/uploads/2017/05/Walmart-Logo-2012.png"
            alt="Walmart Logo"
            className="h-8 w-auto"
          />
          <span className="text-[#0071dc] font-bold text-2xl tracking-tight">
            Walmart
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="/ai-agent"
            className="bg-[#ffc220] hover:bg-[#ffe033] text-[#0071dc] font-bold px-6 py-2 rounded-full shadow border border-[#ffe033] transition-colors duration-150"
          >
            Try AI Agent
          </a>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-3xl font-bold text-[#0071dc] mb-6 text-center">
          Store Map & Path
        </h2>
        <div className="w-full max-w-2xl">
          <MapOverlay path={items} />
        </div>
      </main>
    </div>
  );
}
