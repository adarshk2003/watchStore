import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const NotificationPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const newNotifications = [];

        // Fetch products
        const productsResponse = await axios.get('https://watchstore-backends.onrender.com/products');
        const products = productsResponse.data.data;

        console.log('Products Data:', products);

        if (Array.isArray(products)) {
          products.forEach((product) => {
            const productId = product._id || product.id || 'Unknown ID';
            const productTitle = (product.title || 'Unknown Product').trim(); // Trim title
            const trimmedTitle =
              productTitle.length > 50 ? `${productTitle.slice(0, 47)}...` : productTitle; // Limit length
            const productStock = product.stock ?? 'N/A';

            console.log(`Product ID: ${productId}, Name: ${trimmedTitle}, Stock: ${productStock}`);

            if (product.stock === 0) {
              newNotifications.push({ id: productId, text: `${trimmedTitle} is out of stock!` });
            } else if (product.stock < 10) {
              newNotifications.push({
                id: `${productId}-low-stock`,
                text: `${trimmedTitle} has less than 10 in stock!`,
              });
            }
          });
        }

        // Fetch orders
        const ordersResponse = await axios.get('https://watchstore-backends.onrender.com/viewAllOrders');
        const orders = ordersResponse.data.data;

        console.log('Orders Data:', orders);

        if (Array.isArray(orders)) {
          const newOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return orderDate > yesterday;
          });

          console.log('New Orders:', newOrders);

          newOrders.forEach((order) => {
            newNotifications.push({
              id: order._id,
              text: `New order placed! Order ID: ${order._id}`,
            });
          });
        }

        setNotifications(newNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center justify-center">
      <button onClick={handleNotificationClick} className="bg-transparent ">
        <span>Notification</span>
      </button>

      {isVisible && (
        <div className="fixed top-16 w-80 bg-white shadow-lg rounded-lg p-4 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-700">Notifications</h2>
            <button
              onClick={handleNotificationClick}
              className="text-gray-500 hover:text-gray-700 bg-black/10 rounded-full p-1"
            >
              X
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-700">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-gray-700">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="flex items-center space-x-3 bg-gray-100 p-2 rounded-md shadow-sm">
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <FaBell />
                  </div>
                  <p className="text-sm text-gray-700">{notif.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
