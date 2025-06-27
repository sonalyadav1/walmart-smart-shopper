// Displays a product + brand swap buttons
export default function ProductCard({ product, onRemove, onBrandSwap, onBackToOriginal, onAddToCart, inCart }) {
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
          <span className="walmart-alternatives-label">
            {product.selectedAltIndex !== undefined ? "Currently selected alternative:" : "Alternative brands:"}
          </span>
          <div className="walmart-alternatives-buttons">
            {/* Show "Back to Original" button if an alternative is currently selected */}
            {product.selectedAltIndex !== undefined && product.original && (
              <button
                className="walmart-original-btn"
                onClick={onBackToOriginal}
                type="button"
                title="Switch back to original product"
              >
                <span className="walmart-alt-brand">{product.original.brand || "Original"}</span>
                <span className="walmart-alt-price">${product.original.price?.toFixed(2) || "N/A"}</span>
                <span className="walmart-original-label">Original</span>
              </button>
            )}
            
            {/* Show alternative buttons (excluding the currently selected one) */}
            {product.alternatives.map((alt, i) => {
              // Don't show the currently selected alternative
              if (product.selectedAltIndex === i) return null;
              
              return (
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
              );
            })}
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
          {inCart ? (
            <>
              <svg className="walmart-cart-btn-icon" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Added to Cart
            </>
          ) : (
            <>
              <svg className="walmart-cart-btn-icon" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6M9 19.5h.01M20 19.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
