import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addToCart } from './cartUtil';
import {
  FaArrowLeft,
  FaBolt,
  FaCheck,
  FaHeart,
  FaRegHeart,
  FaShieldAlt,
  FaShoppingCart,
  FaTruck,
} from 'react-icons/fa';
import NavBaruser from '../navComponent/userNav';

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setProduct(null);
      setSimilarProducts([]);

      try {
        const response = await axios.get(`${API_BASE_URL}/product/${id}`);
        const productData = response.data;
        if (!active) return;

        setProduct(productData);
        setMainImage(productData.product_images?.[0] || '');

        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        setInCart(cartItems.includes(productData._id));
        setInWishlist(wishlistItems.includes(productData._id));

        const token = localStorage.getItem('authToken');
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          axios.get(`${API_BASE_URL}/viewCart`, config)
            .then((cartResponse) => {
              if (!active) return;
              const items = cartResponse.data?.items || [];
              setInCart(items.some((item) => item.productId?._id === productData._id));
            })
            .catch((cartError) => console.error('Could not check the shopping bag:', cartError));
          axios.get(`${API_BASE_URL}/viewWishlist`, config)
            .then((wishlistResponse) => {
              if (!active) return;
              const items = wishlistResponse.data?.items || [];
              setInWishlist(items.some((item) => item.productId?._id === productData._id));
            })
            .catch((wishlistError) => console.error('Could not check the wishlist:', wishlistError));
        }

        if (productData.category) {
          try {
            const similarResponse = await axios.get(
              `${API_BASE_URL}/products/category/${encodeURIComponent(productData.category)}`,
              { params: { page: 1, limit: 8, availableOnly: true } }
            );
            if (active) {
              const matches = (similarResponse.data?.data || [])
                .filter((item) => item._id !== productData._id);
              setSimilarProducts(matches);
            }
          } catch (similarError) {
            console.error('Could not load similar watches:', similarError);
          }
        }
      } catch (requestError) {
        console.error('Product fetch error:', requestError);
        if (active) setError('We could not load this watch. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (inCart) {
      toast.info('This watch is already in your bag.');
      return;
    }

    const { success } = await addToCart(product._id);
    if (success) {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      if (!cartItems.includes(product._id)) {
        localStorage.setItem('cartItems', JSON.stringify([...cartItems, product._id]));
      }
      setInCart(true);
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    try {
      if (inWishlist) {
        await axios.delete(`${API_BASE_URL}/deleteWishlist/${product._id}`, {
          headers: { Authorization: `bearer ${token}` },
        });
        const updatedWishlist = wishlistItems.filter((item) => item !== product._id);
        localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
        setInWishlist(false);
        toast.success('Removed from wishlist.');
      } else {
        await axios.post(
          `${API_BASE_URL}/addWishlist`,
          { productId: product._id },
          { headers: { Authorization: `bearer ${token}` } }
        );
        if (!wishlistItems.includes(product._id)) {
          localStorage.setItem('wishlistItems', JSON.stringify([...wishlistItems, product._id]));
        }
        setInWishlist(true);
        toast.success('Added to wishlist.');
      }
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not update your wishlist.');
    }
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0 || product.isStatus) return;
    navigate('/Checkout', {
      state: {
        cartItems: [{ productId: product, quantity: 1 }],
        total: product.price,
      },
    });
  };

  if (loading) {
    return (
      <>
        <NavBaruser />
        <main className="min-h-screen bg-[#f7f6f2] px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-stone-200 bg-white p-10 text-center text-stone-600" role="status">
            Loading watch details…
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <NavBaruser />
        <main className="min-h-screen bg-[#f7f6f2] px-4 py-16 sm:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-700" role="alert">{error || 'This watch could not be found.'}</p>
            <Link to="/shop" className="mt-5 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
              Return to collection
            </Link>
          </div>
        </main>
      </>
    );
  }

  const available = !product.isStatus && product.stock > 0;
  const images = product.product_images?.length ? product.product_images : ['/Omega.jpeg'];
  const specifications = [
    ['Model', product.model],
    ['Case material', product.caseMaterial],
    ['Dial', product.dial],
    ['Bracelet', product.bracelet],
    ['Movement', product.movement],
    ['Power reserve', `${product.power} hours`],
    ['Water resistance', `${product.waterResestence} meters`],
    ...(product.crystal ? [['Crystal', product.crystal]] : []),
  ];

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 pb-16 pt-6 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
            <FaArrowLeft aria-hidden="true" /> Back to collection
          </Link>

          <section className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-[#f1eee7] p-8 sm:min-h-[520px] sm:p-12">
                <img
                  src={mainImage || images[0]}
                  alt={product.title}
                  className="max-h-[460px] w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2" aria-label="Product images">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setMainImage(image)}
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={mainImage === image}
                      className={`h-20 w-20 shrink-0 rounded-xl border bg-white p-2 transition sm:h-24 sm:w-24 ${mainImage === image ? 'border-emerald-900 ring-2 ring-emerald-100' : 'border-stone-200 hover:border-stone-400'}`}
                    >
                      <img src={image} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col py-2 lg:py-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">{product.brand}</p>
              <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-5xl">{product.title}</h1>
              <p className="mt-5 text-3xl font-semibold tracking-tight">₹{Number(product.price).toLocaleString('en-IN')}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${available ? 'bg-emerald-700' : 'bg-stone-400'}`} aria-hidden="true" />
                <p className={`text-sm font-medium ${available ? 'text-emerald-900' : 'text-stone-500'}`}>
                  {available ? (product.stock <= 5 ? `Only ${product.stock} left` : 'Available now') : product.isStatus ? 'Currently unavailable' : 'Out of stock'}
                </p>
              </div>
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-stone-600 sm:text-base">{product.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!available || inCart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {inCart ? <FaCheck aria-hidden="true" /> : <FaShoppingCart aria-hidden="true" />}
                  {inCart ? 'Added to bag' : available ? 'Add to bag' : 'Unavailable'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!available}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-950 px-5 py-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
                >
                  <FaBolt aria-hidden="true" /> Buy now
                </button>
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  aria-pressed={inWishlist}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-5 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-rose-700 hover:text-rose-700 sm:col-span-2"
                >
                  {inWishlist ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                  {inWishlist ? 'Saved to wishlist' : 'Add to wishlist'}
                </button>
              </div>

              <div className="mt-8 grid gap-3 border-t border-stone-200 pt-6 text-sm text-stone-600 sm:grid-cols-2">
                <p className="flex items-center gap-3"><FaTruck className="text-emerald-900" aria-hidden="true" /> Delivery options at checkout</p>
                <p className="flex items-center gap-3"><FaShieldAlt className="text-emerald-900" aria-hidden="true" /> Secure cash-on-delivery order</p>
              </div>
            </div>
          </section>

          <section className="mt-14 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:mt-20 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-900">Specifications</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">Made to keep time</h2>
            <dl className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              {specifications.map(([label, value]) => (
                <div key={label} className="border-t border-stone-200 py-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {similarProducts.length > 0 && (
            <section className="mt-14 sm:mt-20">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-900">You may also like</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">Similar timepieces</h2>
                </div>
                <Link to="/shop" className="text-sm font-semibold text-emerald-900 underline underline-offset-4">View collection</Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {similarProducts.slice(0, 4).map((similarProduct) => (
                  <Link
                    key={similarProduct._id}
                    to={`/product/${similarProduct._id}`}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="bg-[#f1eee7] p-4">
                      <img
                        src={similarProduct.product_images?.[0] || '/Omega.jpeg'}
                        alt={similarProduct.title || 'Watch'}
                        className="h-36 w-full object-contain transition duration-300 group-hover:scale-105 sm:h-48"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900">{similarProduct.brand}</p>
                      <h3 className="mt-1 truncate font-serif font-semibold">{similarProduct.title}</h3>
                      <p className="mt-2 text-sm font-semibold">₹{Number(similarProduct.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default SingleProduct;
