import axios from 'axios';
import { toast } from 'react-toastify';

export const addToCart = async (productId, setCartItems) => {
  const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

  console.log("Token in addToCart:", token); // Debugging log

  if (!token) {
    toast.error('Please login to add to cart');
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:7000/addCart",
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Assuming response contains updated cart information
    setCartItems((prevItems) => [...prevItems, response.data.cart.items]);

    toast.success('Product added to cart successfully');
  } catch (error) {
    toast.error(
      error.response?.data?.message || error.message || 'Error adding to cart'
    );
  }
};
