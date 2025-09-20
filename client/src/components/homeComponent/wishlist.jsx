import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHeart } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addToCart } from "./cartUtil";

import NavBaruser from "../navComponent/userNav";

const Wishlist = () => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const baseUrl = "https://watchstore-backends.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchCartItems();
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      console.log("No token found.");
    }
  }, [token]);

  const fetchCartItems = async () => {
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(localCart);
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/viewCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartProductIds = response.data.items.map((item) => item.productId._id);
      setCartItems(cartProductIds);
      localStorage.setItem("cartItems", JSON.stringify(cartProductIds));
    } catch (err) {
      console.error("Error fetching cart items:", err);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const { success } = await addToCart(productId, setCartItems);
    if (success) {
      const updatedCart = [...cartItems, productId];
      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        toast.error("Please log in to view your wishlist");
        return;
      }

      try {
        const response = await axios.get(`${baseUrl}/viewWishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data.items);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch wishlist");
      }
    };

    fetchWishlist();
  }, [token]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axios.delete(`${baseUrl}/deleteWishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter((item) => item.productId._id !== productId));
      toast.success("Product removed from wishlist");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove product from wishlist");
    }
  };

  const navigateToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <NavBaruser />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">My Wishlist</h1>
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.productId._id}
                className="border relative rounded-lg shadow-md p-4 flex flex-col"
              >
                <img
                  onClick={() => navigateToProductDetails(item.productId._id)}
                  src={`${baseUrl}/${item.productId.product_images[0]}`}
                  alt={item.productId.title}
                  className="w-full h-48 object-cover mb-4 hover:cursor-pointer"
                />
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {item.productId.title}
                </h2>
                <p className="text-gray-600 text-sm mt-2">₹{item.productId.price}</p>
                <div className="mt-2 flex justify-between items-center">
                  {item.productId.stock > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item.productId._id);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        cartItems.includes(item.productId._id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-emerald-900 hover:bg-emerald-700 text-white"
                      }`}
                      disabled={cartItems.includes(item.productId._id)}
                    >
                      {cartItems.includes(item.productId._id) ? "In Cart" : "Add to Cart"}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId._id)}
                    className="bg-transparent hover:bg-red-600 w-8 h-8 text-black hover:text-white py-2 px-4 rounded-full flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center mt-20 space-y-6">
            <div className="relative bg-red-100 rounded-full p-6">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-red-500 h-16 w-16 animate-pulse"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 max-w-sm text-sm">
              You haven't added any items to your wishlist yet. Start browsing and save your favorite products!
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300 ease-in-out"
            >
              Go Back to Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
