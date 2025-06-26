import { aisleCoords } from "../lib/aisleCoords";

// Displays map + path overlay
export default function MapOverlay({ path }) {
  // Get coordinates for each item in path, sorted by aisle for a simple optimized route
  const sorted = (path || []).slice().sort((a, b) => {
    // Sort by aisle string (A1, A2, B1, etc.)
    if (!a.aisle || !b.aisle) return 0;
    return a.aisle.localeCompare(b.aisle);
  });
  const coords = sorted.map(item => aisleCoords[item.aisle] || { x: 50, y: 50 });

  return (
    <div className="relative w-full max-w-2xl">
      <img src="/store-map.png" alt="Store Map" className="w-full rounded" />
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{zIndex:2}}>
        {/* Draw lines for the route */}
        {coords.length > 1 && coords.map((pt, i) =>
          i > 0 ? (
            <line
              key={i}
              x1={coords[i-1].x}
              y1={coords[i-1].y}
              x2={pt.x}
              y2={pt.y}
              stroke="#f59e42"
              strokeWidth="6"
              opacity="0.7"
            />
          ) : null
        )}
        {/* Draw numbered stops */}
        {coords.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="16" fill="#2563eb" opacity="0.85" />
            <text x={pt.x} y={pt.y+5} textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">{i+1}</text>
          </g>
        ))}
      </svg>
      {/* Show item names and order below the map */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {sorted.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-[#0071dc] font-semibold border border-[#e5e7eb]">
            <span className="bg-[#ffc220] text-[#0071dc] rounded-full px-2 py-0.5 font-bold mr-2">{i+1}</span>
            {item.name} <span className="text-gray-400 ml-2">(Aisle {item.aisle})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
