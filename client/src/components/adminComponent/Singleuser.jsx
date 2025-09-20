import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaBan, FaUnlockAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const baseUrl = "https://watchstore-backends.onrender.com";

const SingleUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseUrl}/user/${id}`);
        setUser(response.data.data[0]);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/products/seller/${id}`);
        if (response.data.success) {
          setUserProducts(response.data.data);
        } else {
          setUserProducts([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Something went wrong");
        setLoading(false);
      }
    };

    if (user && user.user_type === "675870f3ae9c6b1dffa1a7ee") {
      fetchUserProducts();
    }
  }, [id, user]);

  const handleBlockProduct = async (productId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `${baseUrl}/unblockP` : `${baseUrl}/blockP`;
      const response = await axios.post(
        endpoint,
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data) {
        // Update the product status in the state
        setUserProducts(
          userProducts.map((product) =>
            product._id === productId ? { ...product, isStatus: !isBlocked } : product
          )
        );
        toast.success(`Product ${isBlocked ? "unblocked" : "blocked"} successfully.`);
        console.log(`product${isBlocked?"unblocked":"blocked"} successfully`);
      }
    } catch (err) {
      console.error(`Error ${isBlocked ? "unblocking" : "blocking"} product:`, err);
      toast.error(`Failed to ${isBlocked ? "unblock" : "block"} product.`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="fixed bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
      <div className="bg-white p-8 shadow-2xl w-full h-auto max-h-screen overflow-y-auto rounded-lg">
        <div className="space-y-10">
          {/* User Information */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 capitalize mb-6">{user.name}</h2>
            <div className="space-y-3">
              <p className="text-xl font-medium text-gray-700">
                <strong>Name:</strong> <span className="text-indigo-600">{user.name}</span>
              </p>
              <p className="text-xl font-medium text-gray-700">
                <strong>Email:</strong> <span className="text-indigo-600">{user.email}</span>
              </p>
              <p className="text-xl font-medium text-gray-700 capitalize">
                <strong>Role:</strong>{" "}
                <span className="text-indigo-600">
                  {user.user_type === "67587113ae9c6b1dffa1a7ef"
                    ? "Customer"
                    : user.user_type === "675870dbae9c6b1dffa1a7ed"
                    ? "Admin"
                    : "Seller"}
                </span>
              </p>
            </div>
          </div>

          {/* Seller's Products */}
          {user.user_type === "675870f3ae9c6b1dffa1a7ee" && (
            <div>
              <h3 className="text-3xl font-semibold text-center text-gray-800 mb-8">
                Products Uploaded by {user.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {userProducts.length > 0 ? (
                  userProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
                    >
                      <img
                        src={`${baseUrl}/${product.product_images[0]}`}
                        alt={product.title}
                        className="w-full h-56 object-cover rounded-md mb-6 transform hover:scale-105 transition-all duration-300 ease-in-out"
                      />
                      <h3 className="text-gray-800 text-xl font-semibold mb-2">{product.title}</h3>
                      <p className="text-gray-600 text-md mb-4">{product.brand}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="text-indigo-600 hover:text-indigo-800 text-lg font-semibold flex items-center"
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button
                          onClick={() => handleBlockProduct(product._id, product.isStatus)}
                          className={`text-lg font-semibold flex items-center ${
                            product.isStatus
                              ? "text-green-600 hover:text-green-800"
                              : "text-red-600 hover:text-red-800"
                          }`}
                        >
                          {product.isStatus ? (
                            <>
                              <FaUnlockAlt className="mr-2" /> Unblock
                            </>
                          ) : (
                            <>
                              <FaBan className="mr-2" /> Block
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No products uploaded by this user yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleUser;
