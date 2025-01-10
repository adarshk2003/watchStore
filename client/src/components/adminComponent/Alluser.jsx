import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEye, FaTrash, FaSpinner, FaBan, FaUnlockAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NavAdmin from "./AdminNav";

const Allusers = () => {
  const upgradeReqSection = useRef(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showUpgradeRequests, setShowUpgradeRequests] = useState(false);
  const [approveError, setApproveError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:7000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
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

  const handleShowUpgradeRequests = () => {
    setShowUpgradeRequests(!showUpgradeRequests);
  };

  useEffect(() => {
    const fetchUpgradeRequests = async () => {
      try {
        const response = await axios.get("http://localhost:7000/upgradeRequests", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setUpgradeRequests(response.data.data);
      } catch (err) {
        console.error("Failed to fetch upgrade requests", err);
      }
    };

    fetchUpgradeRequests();
  }, []);

  const handleBlockUser = async (userId) => {
    const payload = { userId };
    try {
      await axios.post("http://localhost:7000/block", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setUsers(users.map((user) => (user._id === userId ? { ...user, isBlocked: true } : user)));
      toast.success("User blocked successfully");
    } catch (error) {
      setError("Error blocking user");
      toast.error("Failed to block user.");
    }
  };

  const handleUnblockUser = async (userId) => {
    const payload = { userId };
    try {
      await axios.post("http://localhost:7000/unblock", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setUsers(users.map((user) => (user._id === userId ? { ...user, isBlocked: false } : user)));
      toast.success("User unblocked successfully");
    } catch (error) {
      setError("Error unblocking user");
      toast.error("Failed to unblock user.");
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:7000/approveUpgrade/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setUpgradeRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
      toast.success("Upgrade request approved.");
    } catch (err) {
      setApproveError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:7000/rejectUpgrade/${requestId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setUpgradeRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
      toast.success("Upgrade request rejected.");
    } catch (err) {
      toast.error("Failed to reject upgrade request.");
    }
  };

  const deleteUser = async (userId) => {
    setDeleting(userId);
    try {
      await axios.delete(`http://localhost:7000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("User deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete user.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users
    .filter((user) => user.user_type !== "675870dbae9c6b1dffa1a7ed")
    .filter((user) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        (user.user_type === "67587113ae9c6b1dffa1a7ef" && "customer".includes(lowerCaseQuery)) ||
        (user.user_type === "675870f3ae9c6b1dffa1a7ee" && "seller".includes(lowerCaseQuery))
      );
    });

  const customers = filteredUsers.filter((user) => user.user_type === "67587113ae9c6b1dffa1a7ef");
  const sellers = filteredUsers.filter((user) => user.user_type !== "67587113ae9c6b1dffa1a7ef");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-bold text-gray-700">Loading users...</div>
      </div>
    );
  }

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
         {/* Upgrade Requests Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 bg-blue-200 p-4 rounded-md">Upgrade Requests</h3>
          {upgradeRequests.length === 0 ? (
            <p className="text-center">No upgrade requests found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {upgradeRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-200 text-center"
                >
                  <h4 className="text-lg font-semibold">{request.companyName}</h4>
                  <p className="text-sm text-gray-600">{request.email}</p>
                  <p className="text-sm text-gray-600">License: {request.license}</p>
                  <div className="flex justify-center mt-4 gap-3">
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      className="px-4 py-2 bg-red-700 hover:bg-red-900 text-white rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
