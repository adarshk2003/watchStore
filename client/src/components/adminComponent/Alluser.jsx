import React, { useState, useEffect } from "react";
import NavAdmin from "./AdminNav";
import axios from "axios";
import { FaEye, FaTrash, FaSpinner, FaBan, FaUnlockAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Allusers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // All users from API
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:7000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `bearer ${localStorage.getItem("authToken")}`,
          },
        });

        setUsers(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Block User Function with Debugging
  const handleBlockUser = async (userId) => {
    console.log("Blocking user:", userId); 

    const payload = { userId }; 
    console.log("Request payload:", payload);

    try {
      const response = await axios.post("http://localhost:7000/block", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Ensure authToken is sent
        },
      });

      console.log("Response from server:", response.data); // Log server response

      setUsers(users.map((user) => (user._id === userId ? { ...user, isBlocked: true } : user)));
      toast.success("User blocked successfully");
    } catch (error) {
      console.error("Error blocking user:", error); // Log error
      setError("Error blocking user");
      toast.error("Failed to block user.");
    }
  };

  // Unblock User Function
  const handleUnblockUser = async (userId) => {
    console.log("un Blocking user:", userId); // Log userId for debugging
    const payload = { userId }; 
    console.log("Request payload:", payload); // Log payload for debugging
    try {
      const response = await axios.post("http://localhost:7000/unblock", payload,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Ensure authToken is sent
        },
      });
      setUsers(users.map((user) => (user._id === userId ? { ...user, isBlocked: false } : user)));
      toast.success("User unblocked successfully");
      console.log("unblock:",response);
    } catch (error) {
      setError("Error unblocking user");
    }
  };

  // Filter users based on search query
  const filteredUsers = users
    .filter((user) => user.user_type !== "675870dbae9c6b1dffa1a7ed") // Exclude Admin by user_type
    .filter((user) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.user_type === "67587113ae9c6b1dffa1a7ef" && "customer".includes(lowerCaseQuery)) || // Match role: Customer
        (user.user_type === "675870f3ae9c6b1dffa1a7ee" && "seller".includes(lowerCaseQuery)) // Match role: Seller
      );
    });

  const customers = filteredUsers.filter((user) => user.user_type === "67587113ae9c6b1dffa1a7ef"); // Filter Customers
  const sellers = filteredUsers.filter((user) => user.user_type !== "67587113ae9c6b1dffa1a7ef"); // Filter Sellers

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-bold text-gray-700">Loading users...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-bold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <NavAdmin />
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-center">Users</h2>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 w-full sm:w-1/2 md:w-1/3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Sellers Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 bg-black/10 rounded-md p-4">Sellers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sellers.map((user) => (
              <div
                key={user._id}
                className="bg-black/20 shadow-md rounded-lg p-4 hover:shadow-lg transition duration-200 text-center"
              >
                <h3 className="text-lg font-semibold capitalize text-black">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {/* Buttons Container */}
                <div className="flex justify-center mt-4 gap-3">
                  <button
                    onClick={() => deleteUser(user._id)}
                    disabled={deleting === user._id}
                    className={`px-4 py-2 rounded-lg text-white ${deleting === user._id ? "bg-gray-400" : "bg-red-600 hover:bg-red-800"}`}
                  >
                    {deleting === user._id ? <FaSpinner spin /> : <FaTrash />}
                  </button>
                  <button
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded-lg"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => (user.isBlocked ? handleUnblockUser(user._id) : handleBlockUser(user._id))}
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${user.isBlocked ? "bg-yellow-600 hover:bg-yellow-800" : "bg-red-600 hover:bg-red-800"}`}
                    title={user.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {user.isBlocked ? <FaUnlockAlt /> : <FaBan />}
                    {user.isBlocked ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 bg-green-950/10 rounded-md p-4">Customers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {customers.map((user) => (
              <div
                key={user._id}
                className="bg-black/30 shadow-md rounded-lg p-4 hover:shadow-lg transition duration-200 text-center"
              >
                <h3 className="text-lg font-semibold capitalize text-black">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                {/* Buttons Container */}
                <div className="flex justify-center mt-4 gap-3">
                  <button
                    onClick={() => deleteUser(user._id)}
                    disabled={deleting === user._id}
                    className={`px-4 py-2 rounded-lg text-white ${deleting === user._id ? "bg-gray-400" : "bg-red-600 hover:bg-red-800"}`}
                  >
                    {deleting === user._id ? <FaSpinner spin /> : <FaTrash />}
                  </button>
                  <button
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded-lg"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => (user.isBlocked ? handleUnblockUser(user._id) : handleBlockUser(user._id))}
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${user.isBlocked ? "bg-yellow-600 hover:bg-yellow-800" : "bg-red-600 hover:bg-red-800"}`}
                    title={user.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {user.isBlocked ? <FaUnlockAlt /> : <FaBan />}
                    {user.isBlocked ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Allusers;
