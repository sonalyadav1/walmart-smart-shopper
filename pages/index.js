// Walmart-style homepage with header and options
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="header-walmart py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Walmart-Logo-2012.png" alt="Walmart Logo" className="h-8 w-auto" />
          <span className="text-[#0071dc] font-bold text-2xl tracking-tight">Walmart</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/ai-agent" className="btn-walmart px-6 py-2">Try AI Agent</a>
          <a href="/products" className="bg-[#0071dc] hover:bg-[#005cb2] text-white font-bold px-6 py-2 rounded-full shadow border border-[#0071dc] transition-colors duration-150">Browse Products</a>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <h1 className="text-4xl font-extrabold text-[#0071dc] mb-6 text-center">Walmart AI Smart Shopper</h1>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-xl">Experience the future of shopping: get instant product suggestions, brand alternatives, and in-store navigation with our AI-powered assistant.</p>
        <div className="flex gap-6">
          <a href="/ai-agent" className="btn-walmart px-8 py-4 text-xl shadow-lg border border-[#ffe033]">Start with AI Agent</a>
          <a href="/products" className="bg-[#0071dc] hover:bg-[#005cb2] text-white font-bold px-8 py-4 rounded-full shadow-lg border border-[#0071dc] text-xl transition-colors duration-150">See Example Products</a>
        </div>
      </main>
    </div>
  );
}
