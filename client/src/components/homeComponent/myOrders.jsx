import { useEffect, useState } from "react";
import axios from "axios";
import NavBaruser from "../navComponent/userNav";

const baseUrl = 'https://watchstore-backends.onrender.com';

const OrderDetailPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState({});

  const token = localStorage.getItem("authToken");

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/viewOrders`, {
          headers: { Authorization: `bearer ${token}` },
        });
        if (Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Fetch product details for each product in the orders
  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      try {
        const response = await axios.get(`${baseUrl}/product/${productId}`, {
          headers: { Authorization: `bearer ${token}` },
        });
        setProductDetails((prevDetails) => ({
          ...prevDetails,
          [productId]: response.data,
        }));
      } catch (err) {
        console.error("Failed to fetch product details", err);
      }
    };

    orders.forEach((order) => {
      order.products.forEach((product) => {
        const productId = product.productId?._id; 
        if (productId && !productDetails[productId]) {
          fetchProductDetails(productId); 
        }
      });
    });
  }, [orders, productDetails, token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600 font-bold p-4 bg-red-100 rounded-lg shadow-md text-center ">{error}</p>;

  const totalPurchasedPrice = orders.reduce((total, order) => {
    return (
      total +
      order.products.reduce((orderTotal, product) => {
        const productDetail = productDetails[product.productId?._id]; // Safely access productId
        if (productDetail) {
          return orderTotal + (productDetail?.price || 0) * product.quantity;
        }
        return orderTotal;
      }, 0)
    );
  }, 0);

  return (
    <>
      <NavBaruser />
      <div className="container mx-auto p-4">
        <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow-lg border border-gray-300">
          <h2 className="text-2xl font-bold mb-2">Total Purchased Price</h2>
          <p className="text-green-600 text-lg">₹ {totalPurchasedPrice.toFixed(2)}</p>
        </div>

        {orders.length > 0 ? (
          orders.map((order) => {
            const totalOrderPrice = order.products.reduce((total, product) => {
              const productDetail = productDetails[product.productId?._id];
              if (productDetail) {
                return total + (productDetail?.price || 0) * product.quantity;
              }
              return total;
            }, 0);

            return (
              <div key={order._id} className="border rounded-lg p-4 mb-4 bg-white shadow-md hover:shadow-lg transition-all">
                <h2 className="text-xl font-bold mb-4">Order ID: {order._id}</h2>
                {order.products.map((product, index) => {
                  const productDetail = productDetails[product.productId?._id];
                  return (
                    <div key={index} className="flex border-b-2 p-4 mb-4">
                      {productDetail ? (
                        <>
                          <img
                            src={`${baseUrl}/${productDetail.product_images[1]}`}
                            alt={productDetail.title}
                            className="w-24 h-24 object-cover mr-4 rounded-lg"
                          />
                          <div>
                            <h3 className="text-lg font-semibold">{productDetail.title}</h3>
                            <p className="text-gray-600">₹ {productDetail.price} x {product.quantity}</p>
                            <p className="text-gray-600">Total: ₹ {productDetail.price * product.quantity}</p>
                          </div>
                        </>
                      ) : (
                        <p>Loading product details...</p>
                      )}
                    </div>
                  );
                })}
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Order Summary</h4>
                  <p className="text-gray-800">Total Price: ₹ {totalOrderPrice.toFixed(2)}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Delivery Address</h4>
                  <p>{order.address}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Shipping Updates</h4>
                  <p>Email: {order.userId.email}</p>
                  <p>Phone: {order.userId.phone}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Status</h4>
                  <p>{order.status}</p>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                      <div
                        style={{
                          width: order.status === "Delivered" ? "100%" : "50%",
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-900"
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Order placed</span>
                      <span>Processing</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </>
  );
};

export default OrderDetailPage;
