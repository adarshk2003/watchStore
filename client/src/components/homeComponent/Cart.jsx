import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
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
        const response = await axios.get("https://watchstore-backends.onrender.com/viewCart", {
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
    }, 0).toFixed(2);
  };

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No token found. Please login.");
      return;
    }

    try {
      const response = await axios.patch(
        `https://watchstore-backends.onrender.com/updateCartQuantity`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.productId._id === productId ? { ...item, quantity } : item
          )
        );
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
        `https://watchstore-backends.onrender.com/deleteCart/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Removed from cart");
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.productId._id !== productId)
        );

        const hasBlockedItems = cartItems.some(
          (item) => item.productId?.isStatus === true
        );
        setBlockedItems(hasBlockedItems);
      } else {
        console.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <>
      <NavBaruser />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="text-gray-500 text-center">Your cart is empty.</div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const product = item.productId;
                  const isBlocked = product?.isStatus;

                  return (
                    <div
                      key={product?._id || item._id}
                      className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                   <img
  onClick={() => product && navigate(`/product/${product._id}`)}
  src={
    product?.product_images?.length > 0
      ? product.product_images[0] // use directly if Cloudinary
      : "/Omega.jpeg"
  }
  alt={product?.title || "Product Image"}
  className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
/>

                        <div>
                          <h2 className="text-lg font-semibold capitalize">
                            {product?.title || "Product not available"}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            ₹ {(product?.price || 0).toFixed(2)}
                          </p>
                          {isBlocked ? (
                            <p className="text-red-600 font-bold">Currently Unavailable</p>
                          ) : (
                            <div className="flex items-center mt-2">
                              <button
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                              >
                                <FaMinus />
                              </button>
                              <span className="mx-4 text-lg font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() =>
                                  updateQuantity(product._id, item.quantity + 1)
                                }
                              >
                                <FaPlus />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => product && removeItemFromCart(product._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="bg-gray-100 p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="text-gray-700 text-lg">
                <p>
                  Total Items: <span className="font-bold">{cartItems.length}</span>
                </p>
                <p className="mt-2">
                  Total Amount: 
                  <span className="font-bold text-green-600">
                    ₹ {calculateTotal()}
                  </span>
                </p>
              </div>
              <button
                className={`mt-6 w-full py-3 text-lg rounded-lg ${
                  blockedItems
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
                disabled={blockedItems}
                onClick={() =>
                  navigate("/Checkout", {
                    state: { cartItems, total: calculateTotal() },
                  })
                }
              >
                {blockedItems ? "Checkout Disabled" : "Proceed to Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
