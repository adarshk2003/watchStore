import axios from 'axios';
import { toast } from 'react-toastify';

// Add to cart utility function
export const addToCart = async (productId) => {
  try {
    // Retrieve the authentication token
    const token = localStorage.getItem("authToken");
    console.log("Token in addToCart:", token);

    // Check if the token is available
    if (!token) {
      toast.error('Please login to add items to your cart.');
      return { success: false, error: "Authentication required" };
    }

    // Make the POST request to add the product to the cart
    const response = await axios.post(
      "http://localhost:7000/addCart",
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Assuming the response contains updated cart items
    const updatedItems = response.data.cart.items;
    console.log("Cart updated successfully:", updatedItems);

    toast.success('Product added to cart successfully!');
    return { success: true, updatedItems };
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error in addToCart:", error.response || error);

    // Extract error message and inform the user
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to add product to cart.";
    toast.error(errorMessage);

    return { success: false, error: errorMessage };
  }
};
