import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const baseUrl = "http://localhost:7000";

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
    navigate(`/product/${productId}`); // Navigate to the product details page
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Wishlist</h1>
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
              <p className="text-gray-600 text-sm mt-2">
                €{item.productId.price}
              </p>
              <div className="mt-2 flex justify-between items-center">
                
                <button
                  className="w-48 mt-2 font-semibold py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-emerald-600"
                >
                  Add to Cart
                </button>
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
        <div className="flex flex-col items-center justify-center text-center mt-20">
          <FontAwesomeIcon className="text-red-600 h-11" icon={faHeartBroken} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-600">
            Looks like you haven't added any products to your wishlist yet.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-900"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
