// Displays cart total + item list with remove functionality
export default function CartSummary({ items, onRemoveItem, onUpdateQuantity }) {
  // Only show valid products (with name and numeric price)
  const validItems = (items || []).filter(
    (i) => i && typeof i.name === "string" && typeof i.price === "number"
  );

  const total = validItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <div className="walmart-cart-summary">
      <h3 className="walmart-cart-summary-title">Cart Summary ({validItems.length} items)</h3>
      
      {validItems.length === 0 ? (
        <div className="walmart-cart-empty-message">
          <span className="walmart-cart-empty-icon">🛍️</span>
          <p>No items in cart yet.</p>
          <p>Start shopping to add items!</p>
        </div>
      ) : (
        <>
          <div className="walmart-cart-items">
            {validItems.map((item, idx) => (
              <div key={idx} className="walmart-cart-item">
                <div className="walmart-cart-item-info">
                  <h4 className="walmart-cart-item-name">{item.name}</h4>
                  <p className="walmart-cart-item-brand">Brand: {item.brand || 'N/A'}</p>
                  <p className="walmart-cart-item-aisle">Aisle: {item.aisle || 'N/A'}</p>
                </div>
                
                <div className="walmart-cart-item-controls">
                  <div className="walmart-quantity-controls">
                    <button 
                      className="walmart-quantity-btn"
                      onClick={() => onUpdateQuantity && onUpdateQuantity(idx, Math.max(1, (item.quantity || 1) - 1))}
                    >
                      -
                    </button>
                    <span className="walmart-quantity">{item.quantity || 1}</span>
                    <button 
                      className="walmart-quantity-btn"
                      onClick={() => onUpdateQuantity && onUpdateQuantity(idx, (item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="walmart-cart-item-price">
                    ${(item.price * (item.quantity || 1)).toFixed(2)}
                  </div>
                  <button
                    className="walmart-remove-item-btn"
                    onClick={() => onRemoveItem && onRemoveItem(idx)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="walmart-cart-total">
            <div className="walmart-total-line">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="walmart-total-line walmart-estimated-tax">
              <span>Estimated Tax:</span>
              <span>${(total * 0.08).toFixed(2)}</span>
            </div>
            <div className="walmart-total-line walmart-final-total">
              <span>Total:</span>
              <span>${(total * 1.08).toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
