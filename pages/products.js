// pages/products.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ProductsPage() {
  const router = useRouter();
  const { page: queryPage, search } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const page = queryPage || 1;
        setCurrentPage(Number(page));
        
        let url = `http://localhost:5000/api/products?page=${page}`;
        if (search) {
          url = `http://localhost:5000/api/search?name=${encodeURIComponent(search)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        
        const data = await res.json();
        
        if (search) {
          setProducts(data.products);
          setTotalPages(1);
        } else {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryPage, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/products');
    }
  };

  const handlePageChange = (newPage) => {
    router.push(`/products?page=${newPage}`);
  };

  return (
    <div className="products-page-container">
      <Head>
        <title>Products | Walmart</title>
        <meta name="description" content="Browse our wide range of products" />
      </Head>

      <style jsx>{`
        .products-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .products-page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .products-page-title {
          color: #0071dc;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .products-search-form {
          display: flex;
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        
        .products-search-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #0071dc;
          border-radius: 4px 0 0 4px;
          font-size: 1rem;
          outline: none;
        }
        
        .products-search-button {
          background: #0071dc;
          color: white;
          border: none;
          padding: 0 1.5rem;
          font-weight: bold;
          cursor: pointer;
          border-radius: 0 4px 4px 0;
          transition: background 0.2s;
        }
        
        .products-search-button:hover {
          background: #005bb5;
        }
        
        .products-list-container {
          margin-bottom: 2rem;
        }

        .products-list{
        display: flex;
        flex-direction: column;}
        
        .product-item {
          border-bottom: 1px solid #e6e6e6;
          padding: 1.5rem 0;
          display: flex;
          flex-direction: column;
        }
        
        .product-name {
          color: #333;
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .product-price {
          color: #e63946;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .product-category {
          display: flex;
          background:rgb(243, 248, 160);
          color: #666;
          max-width: 100px;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }
        
        .product-description {
          color: #555;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        .product-quantity {
          color: #666;
          font-size: 0.9rem;
        }
        
        .products-pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        
        .page-button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .page-button:hover {
          background: #f0f0f0;
        }
        
        .page-button-active {
          background: #0071dc;
          color: white;
          border-color: #0071dc;
        }
        
        .page-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .products-loading {
          text-align: center;
          padding: 2rem;
          font-size: 1.1rem;
          color: #666;
        }
        
        .products-error {
          color: #e63946;
          text-align: center;
          padding: 1rem;
          background: #ffebee;
          border-radius: 8px;
          margin: 1rem 0;
        }
        
        .products-results-count {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>

      <header className="products-page-header">
        <h1 className="products-page-title">Browse Our Products</h1>
      </header>
      
      <form onSubmit={handleSearch} className="products-search-form">
        <input
          type="text"
          className="products-search-input"
          placeholder="Search products by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="products-search-button">
          Search
        </button>
      </form>

      {loading && <div className="products-loading">Loading products...</div>}
      
      {error && <div className="products-error">{error}</div>}

      {!loading && !error && (
        <div className="products-list-container">
          {search && (
            <div className="products-results-count">
              Found {products.length} results for "{search}"
            </div>
          )}

          <div className="products-list">
            {products.map((product) => (
              <div key={product._id} className="product-item">
                <h2 className="product-name">{product.name}</h2>
                <h2 className="product-name">{product._id}</h2>
                <div className="product-price">₹{product.price}</div>
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                {product.quantity && (
                  <div className="product-quantity">Quantity: {product.quantity}</div>
                )}
              </div>
            ))}
          </div>

          {!search && totalPages > 1 && (
            <div className="products-pagination">
              <button
                className={`page-button ${currentPage === 1 ? 'page-button-disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`page-button ${currentPage === pageNum ? 'page-button-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                className={`page-button ${currentPage === totalPages ? 'page-button-disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}