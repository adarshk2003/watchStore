import { useEffect, useState } from "react";
import axios from "axios";
import {toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
  const navigate = useNavigate();
  const baseUrl = "http://localhost:7000";

  // Fetch wishlist from the backend
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

  // Add product to cart
  const handleAddToCart = async (productId) => {
    if (!token) {
      toast.error("Please log in to add to the cart.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/addCart`,
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Product added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // Remove item from wishlist
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

  // Navigate to product details page
  const navigateToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.length > 0 ? (
          wishlist.map((item) => (
            <div
              key={item.productId._id}
              className="border relative rounded-lg shadow-md p-4 flex flex-col"
            >
              <img
                onClick={() => navigateToProductDetails(item.productId._id)}
                src={`${baseUrl}/${item.productId.product_images[0]}`}
                alt={item.productId.title}
                className="w-full h-48 object-contain mb-4 hover:cursor-pointer"
              />
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {item.productId.title}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                ₹{item.productId.price}{" "}
                <span className="line-through text-gray-400">
                  ₹{item.productId.original_price}
                </span>{" "}
                <span className="text-green-600 font-bold">
                  ({item.productId.discount}% off)
                </span>
              </p>
              <button
                onClick={() => handleRemoveFromWishlist(item.productId._id)}
                className="absolute top-0 right-1 mt-2 bg-transparent hover:bg-red-600 w-6 text-black hover:text-white py-2 px-4 rounded-full flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTrash} className="" />
              </button>
              <button
                onClick={() => handleAddToCart(item.productId._id)}
                className="w-full mt-2 font-semibold py-2 border border-gray-300 rounded-md text-gray-800"
              >
                Add to Cart
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">
            Your wishlist is empty.
          </p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
