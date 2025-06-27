// Displays a product + brand swap buttons
export default function ProductCard({ product, onRemove, onBrandSwap, onAddToCart, inCart }) {
  // Format aisle display - remove "aisle" prefix if it already exists
  const formatAisle = (aisle) => {
    if (!aisle) return "N/A";
    const aisleStr = aisle.toString().toLowerCase();
    if (aisleStr.startsWith('aisle ')) {
      return aisle; // Already formatted
    }
    return `Aisle ${aisle.toUpperCase()}`;
  };

  return (
    <div className="walmart-product-card">
      <div className="walmart-product-header">
        <div className="walmart-product-info">
          <h3 className="walmart-product-name">{product.name || "Product Name Unavailable"}</h3>
          <span className="walmart-product-aisle">{formatAisle(product.aisle)}</span>
        </div>
        <button
          className="walmart-btn-remove"
          onClick={onRemove}
          title="Remove from list"
          type="button"
          aria-label="Remove product from list"
        >
          ×
        </button>
      </div>
      
      <div className="walmart-product-details">
        <div className="walmart-product-brand">
          <span className="walmart-brand-label">Brand:</span> 
          <span className="walmart-brand-name">{product.brand || "Generic"}</span>
        </div>
        <div className="walmart-product-price">
          {typeof product.price === "number" && !isNaN(product.price) ? `$${product.price.toFixed(2)}` : "Price unavailable"}
        </div>
      </div>

      {product.alternatives && product.alternatives.length > 0 && (
        <div className="walmart-alternatives">
          <span className="walmart-alternatives-label">Alternative brands:</span>
          <div className="walmart-alternatives-buttons">
            {product.alternatives.map((alt, i) => (
              <button
                key={i}
                className="walmart-alternative-btn"
                onClick={() => onBrandSwap(i)}
                type="button"
                title={`Switch to ${alt.brand || 'alternative brand'}`}
              >
                <span className="walmart-alt-brand">{alt.brand || "Generic"}</span>
                <span className="walmart-alt-price">${alt.price?.toFixed(2) || "N/A"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="walmart-product-actions">
        <button
          className={`walmart-add-to-cart-btn ${inCart ? 'added' : ''}`}
          onClick={onAddToCart}
          disabled={inCart}
          type="button"
          aria-label={inCart ? 'Product added to cart' : 'Add product to cart'}
        >
          {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}
