import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false); // Toggle for edit mode
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage

  useEffect(() => {
    if (token) {
      // Fetch user profile when the component mounts
      axios
        .get('http://localhost:7000/userprofile', {
          headers: {
            Authorization: `bearer ${token}`, // Attach the token in the Authorization header
          },
        })
        .then((response) => {
          setUserData(response.data.data); // Assuming response contains `data` field with user profile
          setFormData({
            name: response.data.data.name,
            email: response.data.data.email,
            address: response.data.data.address || '', // Default to an empty string if address is not provided
            password: '', // Keep password empty by default
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
          setUserData(response.data.data); // Update userData with new data
          setEditMode(false); // Exit edit mode
        })
        .catch((err) => {
          setError(err.response ? err.response.data.message : 'Something went wrong');
        });
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-red-500 text-white p-4 rounded">
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-gray-200 p-4 rounded">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const userTypeDisplay = (type) => {
    switch (type) {
      case '675870f3ae9c6b1dffa1a7ee':
        return <span className="text-yellow-300">Seller</span>;
      case '675870dbae9c6b1dffa1a7ed':
        return <span className="text-red-500">Admin</span>;
      default: // Default to Customer
        return <span className="text-blue-300">Customer</span>;
    }
  };

  return (<>
    <div className="max-w-md mx-auto p-6 text-black shadow-lg rounded-lg mt-10 text-center">
      <h1 className="text-3xl font-semibold mb-6">
        {editMode ? 'Edit Profile' : 'Your Profile'}
      </h1>

      {successMessage && (
        <div className="bg-green-500 text-white p-2 rounded mb-4">{successMessage}</div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between gap-6">
          <label className="block font-medium">Name :</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border p-2 rounded text-black"
            />
          ) : (
            <div className="font-semibold">{userData.name}</div>
          )}
        </div>

        <div className="flex justify-between gap-6">
          <label className="block font-medium">Email :</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 rounded text-black"
            />
          ) : (
            <div>{userData.email}</div>
          )}
        </div>

        <div className="flex justify-between gap-6">
          <label className="block font-medium">Address :</label>
          {editMode ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="border p-2 rounded text-black"
            />
          ) : (
            <div>{userData.address || 'N/A'}</div>
          )}
        </div>

        <div className="flex justify-between gap-6">
          <label className="block font-medium">Account Type :</label>
          <div className="font-semibold">{userTypeDisplay(userData.user_type)}</div>
        </div>
      </div>

      {editMode ? (
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditMode(true)}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Edit Profile
        </button>
      )}
    </div>
    </>);
};

export default Profile;
