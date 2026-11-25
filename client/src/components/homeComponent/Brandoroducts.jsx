import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import NavBaruser from '../navComponent/userNav';

const productsPerPage = 12;

export default function BrandProducts() {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    axios.get(`${API_BASE_URL}/products`, {
      params: {
        page,
        limit: productsPerPage,
        availableOnly: true,
        brand: brandName,
      },
    })
      .then((response) => {
        if (!Array.isArray(response.data?.data) || !response.data?.pagination) {
          throw new Error('The product response was not in the expected format.');
        }
        if (active) {
          setProducts(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching brand products:', requestError);
        if (active) setError(requestError.response?.data?.message || 'Failed to fetch products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brandName, page]);

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 font-serif text-3xl font-semibold text-stone-950">{brandName} Watches</h1>
          {loading ? (
            <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600" role="status">Loading products...</p>
          ) : error ? (
            <p className="rounded-2xl border border-rose-200 bg-white p-8 text-center text-rose-800" role="alert">{error}</p>
          ) : products.length === 0 ? (
            <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">No products found for this brand.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <article key={product._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="w-full text-left"
                    >
                      <img
                        src={product.product_images?.[0] || '/Omega.jpeg'}
                        alt={product.title}
                        className="h-40 w-full rounded-xl bg-[#f1eee7] object-contain p-2 sm:h-52"
                      />
                      <h2 className="mt-3 truncate font-serif font-semibold text-stone-950">{product.title}</h2>
                      <p className="mt-1 text-sm font-medium text-stone-600">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                    </button>
                  </article>
                ))}
              </div>
              {totalPages > 1 && (
                <nav aria-label="Brand product pages" className="mt-7 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
