// Displays cart total + item list
export default function CartSummary({ items }) {
  // Only show valid products (with name and numeric price)
  const validItems = (items || []).filter(
    (i) => i && typeof i.name === "string" && typeof i.price === "number"
  );
  return (
    <div className="border rounded p-4 w-full max-w-md">
      <h3 className="font-bold mb-2">Cart Summary</h3>
      <ul className="mb-2">
        {validItems.length > 0 ? validItems.map((item, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{item.name}</span>
            <span>${item.price.toFixed(2)}</span>
          </li>
        )) : <li>No valid items in cart.</li>}
      </ul>
      <div className="font-semibold">Total: ${validItems.reduce((sum, i) => sum + i.price, 0).toFixed(2)}</div>
    </div>
  );
}
