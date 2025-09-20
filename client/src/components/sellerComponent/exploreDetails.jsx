import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavSellerCom from './NavSellerCom';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FaBox, FaChartLine, FaBan } from 'react-icons/fa';

const DashboardSeller = () => {
  const [selectedFilter, setSelectedFilter] = useState('monthly');
  const [sales, setSales] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [mostSellingProduct, setMostSellingProduct] = useState(null);
  const [blockedProducts, setBlockedProducts] = useState([]);
  const [dateFns, setDateFns] = useState(null);

  useEffect(() => {
    import('date-fns').then((module) => {
      setDateFns(module);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = 'https://watchstore-backends.onrender.com';
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        };

        // Fetch products for blocked products
        const productsResponse = await axios.get(`${apiBaseUrl}/products`, { headers });
        setTotalProducts(productsResponse.data.data.length || 0);

        // Get blocked products
        const blocked = productsResponse.data.data.filter((product) => product.isStatus);
        setBlockedProducts(blocked);

        // Fetch total orders
        const ordersResponse = await axios.get(`${apiBaseUrl}/viewAllOrders`, { headers });
        setTotalOrders(ordersResponse.data.data.length || 0);

        // Extract sales data from orders
        const salesData = groupSalesByTime(ordersResponse.data.data, selectedFilter);
        setSales(salesData);

        // Find the most selling product
        const mostSelling = salesData.length > 0 ? salesData[0] : null;
        setMostSellingProduct(mostSelling);

      } catch (error) {
        console.error('Error fetching data:', error);

        if (error.response && error.response.status === 401) {
          toast.error('Session expired. Redirecting to login.');
        }
      }
    };

    fetchData();
  }, [selectedFilter, dateFns]);

  // Group sales by time (daily, weekly, monthly)
  const groupSalesByTime = (salesData, filter) => {
    if (!dateFns) return [];

    const groupedData = [];

    salesData.forEach((order) => {
      const createdDate = new Date(order.createdAt); // Assuming 'createdAt' is available in the order
      let timeKey = '';

      if (filter === 'daily') {
        timeKey = dateFns.format(dateFns.startOfDay(createdDate), 'yyyy-MM-dd');
      } else if (filter === 'weekly') {
        const startOfWeekDate = dateFns.startOfDay(createdDate);
        timeKey = dateFns.format(startOfWeekDate, 'yyyy-MM-dd');
      } else if (filter === 'monthly') {
        timeKey = dateFns.format(createdDate, 'yyyy-MM');
      } else if (filter === 'yearly') {
        timeKey = dateFns.format(createdDate, 'yyyy');
      }

      const existingGroup = groupedData.find((group) => group.name === timeKey);

      // If the group already exists, accumulate the sales (total amount of sales in each order)
      if (existingGroup) {
        existingGroup.sales += order.total; // Assuming 'total' is the sales value
      } else {
        groupedData.push({ name: timeKey, sales: order.total });
      }
    });

    return groupedData;
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  // Ensure data passed to chart is valid
  const validSalesData = sales.length > 0 ? sales : [{ name: 'No Data', sales: 0 }];

  if (!dateFns) return <div>Loading...</div>;

  return (<>
  <NavSellerCom/>
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-700">seller Dashboard</h1>

      {/* Filters */}
      <div className="mb-6">
        <label htmlFor="filter" className="text-gray-600 mr-4">Filter by:</label>
        <select
          id="filter"
          value={selectedFilter}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <FaBox className="text-green-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Products</p>
            <h2 className="text-2xl font-bold">{totalProducts ? totalProducts.toLocaleString() : '0'}</h2>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <FaChartLine className="text-purple-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold">{totalOrders ? totalOrders.toLocaleString() : '0'}</h2>
          </div>
        </div>
      </div>

      {/* Most Selling Product */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Most Selling Product</h2>
        {mostSellingProduct ? (
          <div>
            <p>Product ID: {mostSellingProduct.title}</p>
            <p>Total Sales: {mostSellingProduct.sales || 0}</p>
          </div>
        ) : (
          <p>No sales data available.</p>
        )}
      </div>

      {/* Blocked Products */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Blocked Products</h2>
        {blockedProducts.length > 0 ? (
          blockedProducts.map((product) => (
            <div key={product._id} className="mb-4">
              <FaBan className="text-red-500 mr-2 inline-block" />
              <span>{product.title}</span>
            </div>
          ))
        ) : (
          <p>No blocked products found.</p>
        )}
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={validSalesData}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
 </>);
};

export default DashboardSeller;
