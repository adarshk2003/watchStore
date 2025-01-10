import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { MdAccountCircle, MdEmail, MdHome, MdOutlineAdminPanelSettings } from 'react-icons/md';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [upgradeData, setUpgradeData] = useState({
    companyName: '',
    license: '',
  });
  const [upgradeSuccessMessage, setUpgradeSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:7000/userprofile', {
          headers: {
            Authorization: `bearer ${token}`,
          },
        })
        .then((response) => {
          setUserData(response.data.data);
          setFormData({
            name: response.data.data.name,
            email: response.data.data.email,
            address: response.data.data.address || '',
            password: '',
          });
        })
        .catch((err) => {
          setError(err.response ? err.response.data.message : 'Something went wrong');
        });
    } else {
      setError('No token found. Please log in.');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpgradeInputChange = (e) => {
    const { name, value } = e.target;
    setUpgradeData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    if (token) {
      axios
        .put(
          'http://localhost:7000/updateUser',
          { ...formData },
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setSuccessMessage('Profile updated successfully');
          setError(null);
          setUserData(response.data.data);
          setEditMode(false);
        })
        .catch((err) => {
          setError(err.response ? err.response.data.message : 'Something went wrong');
        });
    }
  };

  const handleUpgradeRequest = () => {
    if (token) {
      console.log('Sending upgrade request with data:', upgradeData); // Debug: Log upgrade data

      axios
        .post(
          'http://localhost:7000/requestUpgrade',
          { ...upgradeData },
          {
            headers: {
              Authorization: `bearer ${token}`,
            },
          }
        )
        .then((response) => {
          console.log('Upgrade response:', response); // Debug: Log response
          setUpgradeSuccessMessage('Upgrade request submitted successfully');
          setError(null);
        })
        .catch((err) => {
          console.error('Upgrade request error:', err); // Debug: Log error
          setError(err.response ? err.response.data.message : 'Something went wrong');
        });
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-red-500 text-white p-4 rounded shadow-lg">
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-gray-200 p-4 rounded shadow-lg">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const userTypeDisplay = (type) => {
    switch (type) {
      case '675870f3ae9c6b1dffa1a7ee':
        return (
          <span className="text-yellow-400 flex items-center gap-2">
            <MdOutlineAdminPanelSettings /> Seller
          </span>
        );
      case '675870dbae9c6b1dffa1a7ed':
        return (
          <span className="text-red-500 flex items-center gap-2">
            <MdOutlineAdminPanelSettings /> Admin
          </span>
        );
      default:
        return (
          <span className="text-blue-400 flex items-center gap-2">
            <MdAccountCircle /> Customer
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-lg mt-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        {editMode ? 'Edit Profile' : 'Your Profile'}
      </h1>

      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded mb-4 shadow">
          {successMessage}
        </div>
      )}

      {upgradeSuccessMessage && (
        <div className="bg-green-500 text-white p-2 rounded mb-4">{upgradeSuccessMessage}</div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <MdAccountCircle size={24} className="text-gray-500" />
          <label className="font-medium">Name:</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="flex-1 border p-2 rounded text-black"
            />
          ) : (
            <div className="font-semibold text-gray-800 flex-1">{userData.name}</div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <MdEmail size={24} className="text-gray-500" />
          <label className="font-medium">Email:</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="flex-1 border p-2 rounded text-black"
            />
          ) : (
            <div className="text-gray-800 flex-1">{userData.email}</div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <MdHome size={24} className="text-gray-500" />
          <label className="font-medium">Address:</label>
          {editMode ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="flex-1 border p-2 rounded text-black"
            />
          ) : (
            <div className="text-gray-800 flex-1">{userData.address || 'N/A'}</div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <MdOutlineAdminPanelSettings size={24} className="text-gray-500" />
          <label className="font-medium">Account Type:</label>
          <div className="flex-1">{userTypeDisplay(userData.user_type)}</div>
        </div>
      </div>

      {/* Show upgrade form only for customers */}
      {userData.user_type === '67587113ae9c6b1dffa1a7ef' && !editMode && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Upgrade to Seller</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="font-medium">Company Name:</label>
              <input
                type="text"
                name="companyName"
                value={upgradeData.companyName}
                onChange={handleUpgradeInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="font-medium">License:</label>
              <input
                type="text"
                name="license"
                value={upgradeData.license}
                onChange={handleUpgradeInputChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleUpgradeRequest}
                className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
              >
                Request Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-8">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="flex items-center bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              <FaSave className="mr-2" /> Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            <FaEdit className="mr-2" /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
