import { API_BASE_URL } from '../../config/api.js';
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import NavBaruser from "../navComponent/userNav";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockedItems, setBlockedItems] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/viewCart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.items && Array.isArray(response.data.items)) {
          const validItems = response.data.items.filter((item) => item?.productId);
          setCartItems(validItems);

          const hasBlockedItems = validItems.some(
            (item) => item.productId?.isStatus === true
          );
          setBlockedItems(hasBlockedItems);
        } else {
          setError("Failed to fetch cart items.");
        }
      } catch (error) {
        console.error(error);
        setError("Error fetching cart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item?.productId?.price) || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  };

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/updateCartQuantity`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedItems = cartItems.map((item) =>
          item.productId._id === productId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
        setBlockedItems(updatedItems.some((item) => item.productId?.isStatus === true));
        setError("");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update item quantity. Please try again.");
    }
  };

  const removeItemFromCart = async (productId) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/deleteCart/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Removed from cart");
        const updatedItems = cartItems.filter((item) => item.productId._id !== productId);
        setCartItems(updatedItems);
        setBlockedItems(updatedItems.some((item) => item.productId?.isStatus === true));
        setError("");
      } else {
        console.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item. Please try again.");
    }
  };

  return (
    <>
      <NavBaruser />
      <main className="min-h-screen bg-[#f7f6f2] px-4 pb-16 pt-8 text-stone-900 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 border-b border-stone-200 pb-7 sm:mb-10">
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-emerald-950">
              <FaArrowLeft aria-hidden="true" /> Continue shopping
            </Link>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900">Your selection</p>
                <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">Shopping bag</h1>
              </div>
              {!loading && !error && (
                <p className="text-sm text-stone-500">
                  {cartItems.length} {cartItems.length === 1 ? 'piece' : 'pieces'}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <span>{error}</span>
              {!localStorage.getItem("authToken") && (
                <Link to="/login" className="font-semibold underline underline-offset-4">Sign in</Link>
              )}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-600" role="status">
              Loading your bag…
            </div>
          ) : error && cartItems.length === 0 ? null : cartItems.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1eee7] text-emerald-950">
                <FaTrash aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold">Your bag is waiting</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Explore the collection and add a timepiece that feels like yours.
              </p>
              <Link to="/shop" className="mt-6 inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Explore watches
              </Link>
            </div>
          ) : !error && cartItems.length > 0 ? (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
                <section aria-label="Items in your shopping bag" className="space-y-4">
                  {cartItems.map((item) => {
                    const product = item.productId;
                    const isBlocked = product?.isStatus;
                    const quantity = item.quantity || 1;
                    const image = product?.product_images?.[0] || "/Omega.jpeg";

                    return (
                      <article key={product?._id || item._id} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-5">
                        <Link to={product ? `/product/${product._id}` : "/shop"} className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f1eee7] sm:h-36 sm:w-32">
                          <img src={image} alt={product?.title || "Watch"} className="h-full w-full object-contain p-2" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-900">{product?.brand || "Clyro"}</p>
                            <h2 className="mt-1 truncate font-serif text-lg font-semibold sm:text-xl">
                              <Link to={product ? `/product/${product._id}` : "/shop"} className="hover:text-emerald-900">
                                {product?.title || "Product not available"}
                              </Link>
                            </h2>
                            <p className="mt-2 text-sm font-medium text-stone-700">₹{Number(product?.price || 0).toLocaleString("en-IN")}</p>
                            {isBlocked && <p className="mt-2 text-xs font-semibold text-red-700">Currently unavailable</p>}
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            {!isBlocked && product && (
                              <div className="flex items-center rounded-full border border-stone-300">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${product.title}`}
                                  className="p-2.5 text-stone-600 transition hover:text-emerald-950 disabled:opacity-40"
                                  onClick={() => updateQuantity(product._id, Math.max(1, quantity - 1))}
                                  disabled={quantity <= 1}
                                >
                                  <FaMinus aria-hidden="true" size={11} />
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${product.title}`}
                                  className="p-2.5 text-stone-600 transition hover:text-emerald-950 disabled:opacity-40"
                                  onClick={() => updateQuantity(product._id, quantity + 1)}
                                  disabled={quantity >= product.stock}
                                >
                                  <FaPlus aria-hidden="true" size={11} />
                                </button>
                              </div>
                            )}
                            <button
                              type="button"
                              aria-label={`Remove ${product?.title || "item"} from bag`}
                              onClick={() => product && removeItemFromCart(product._id)}
                              className="rounded-full p-2.5 text-stone-400 transition hover:bg-red-50 hover:text-red-700"
                            >
                              <FaTrash aria-hidden="true" size={15} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>

                <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                  <h2 className="font-serif text-2xl font-semibold">Order summary</h2>
                  <div className="mt-6 space-y-3 border-b border-stone-200 pb-5 text-sm text-stone-600">
                    <div className="flex justify-between">
                      <span>Items ({cartItems.reduce((count, item) => count + (item.quantity || 1), 0)})</span>
                      <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-medium text-emerald-900">Calculated at checkout</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-5 text-base font-semibold">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toLocaleString("en-IN")}</span>
                  </div>
                  {blockedItems && (
                    <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="status">
                      Remove unavailable items before proceeding to checkout.
                    </p>
                  )}
                  <button
                    type="button"
                    className="w-full rounded-xl bg-emerald-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                    disabled={blockedItems}
                    onClick={() => navigate("/Checkout", { state: { cartItems, total: calculateTotal().toFixed(2) } })}
                  >
                    {blockedItems ? "Checkout unavailable" : "Continue to checkout"}
                  </button>
                  <p className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
                    <FaLock aria-hidden="true" /> Secure checkout · Cash on delivery
                  </p>
                </aside>
              </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
