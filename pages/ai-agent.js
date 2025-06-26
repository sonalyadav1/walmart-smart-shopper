import { useState } from "react";
import { useRouter } from "next/router";

const STRUCTURED_PROMPT_PREFIX =
  "Return a JSON array of Walmart-style grocery products for the following shopping need. Each product should have: name, aisle, price, brand, and alternatives (an array of objects with name, price, brand). Do not include any text or explanation, only the JSON array. Shopping need: ";

export default function AIAgent() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function extractJsonArray(text) {
    // Try to extract the first JSON array from the text
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
        // fallback: treat as plain text array
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
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="header-walmart py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Walmart-Logo-2012.png" alt="Walmart Logo" className="h-8 w-auto" />
          <span className="text-[#0071dc] font-bold text-2xl tracking-tight">Walmart</span>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/ai-agent" className="btn-walmart px-6 py-2">Try AI Agent</a>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-3xl font-bold text-[#0071dc] mb-6 text-center">What do you want to prepare or buy?</h2>
        <form className="w-full max-w-md flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. pasta dinner for 4"
            className="border border-[#0071dc] p-3 rounded-lg text-lg focus:ring-2 focus:ring-[#0071dc] outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn-walmart px-6 py-3 text-lg"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Get Suggestions"}
          </button>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </form>
      </main>
    </div>
  );
}
