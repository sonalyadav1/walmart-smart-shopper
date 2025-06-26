// Displays a product + brand swap buttons
export default function ProductCard({ product, onRemove, onBrandSwap }) {
  return (
    <div className="product-card p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="product-title">{product.name || "N/A"}</div>
        <span className="product-aisle">Aisle {product.aisle || "N/A"}</span>
        <button
          className="btn-remove ml-2 text-xl"
          onClick={onRemove}
          title="Remove from list"
          type="button"
        >
          &minus;
        </button>
      </div>
      <div className="text-sm text-gray-600">
        Brand: <span className="product-brand">{product.brand || "N/A"}</span>
      </div>
      <div className="product-price">
        {typeof product.price === "number" && !isNaN(product.price) ? `$${product.price.toFixed(2)}` : "N/A"}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {product.alternatives && product.alternatives.map((alt, i) => (
          <button
            key={i}
            className="px-3 py-1 rounded-full text-xs font-medium border border-[#0071dc] text-[#0071dc] bg-white hover:bg-[#e6f1fb] transition-colors duration-150"
            onClick={() => onBrandSwap(i)}
            type="button"
          >
            {alt.brand || "N/A"} <span className="text-gray-500">({alt.name ? alt.name.split(' ')[0] : "N/A"})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
