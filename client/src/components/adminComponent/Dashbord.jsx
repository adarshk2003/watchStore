import React, { useState, useEffect } from 'react';
import NavAdmin from './AdminNav';
import axios from 'axios';
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
import { FaUsers, FaBox, FaChartLine } from 'react-icons/fa';

const DashboardAdmin = () => {
  const [selectedFilter, setSelectedFilter] = useState('monthly');
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dateFns, setDateFns] = useState(null);

  useEffect(() => {
    import('date-fns').then((module) => {
      setDateFns(module);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBaseUrl = 'http://localhost:7000';
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        };

        // Fetch total users
        const usersResponse = await axios.get(`${apiBaseUrl}/users`, { headers });
        setTotalUsers(usersResponse.data.data.length || 0);

        // Fetch total products
        const productsResponse = await axios.get(`${apiBaseUrl}/products`, { headers });
        setTotalProducts(productsResponse.data.data.length || 0);

        // Fetch total orders
        const ordersResponse = await axios.get(`${apiBaseUrl}/viewAllOrders`, { headers });
        setTotalOrders(ordersResponse.data.data.length || 0);
        setOrders(ordersResponse.data.data);

        // Fetch sales data based on the filter
        const salesResponse = await axios.get(`${apiBaseUrl}/viewAllOrders?filter=${selectedFilter}`, {
          headers,
        });

        // Transform sales data for the chart
        const salesData = groupSalesByTime(salesResponse.data.data, selectedFilter);
        setSales(salesData);

        // Users Data Transformation for the Chart
        const usersResponseData = usersResponse.data.data;
        const groupedUsers = groupUsersByTime(usersResponseData, selectedFilter);
        setUsers(groupedUsers);

      } catch (error) {
        console.error('Error fetching data:', error);

        if (error.response && error.response.status === 401) {
          toast.error('Session expired. Redirecting to login.');
        }
      }
    };

    fetchData();
  }, [selectedFilter, dateFns]);

  const groupUsersByTime = (usersData, filter) => {
    if (!dateFns) return [];
    
    const groupedData = [];

    usersData.forEach((user) => {
      const createdDate = new Date(user.createdAt);
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
      
      if (existingGroup) {
        existingGroup.users += 1;
      } else {
        groupedData.push({ name: timeKey, users: 1 });
      }
    });

    return groupedData;
  };

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

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const apiBaseUrl = 'http://localhost:7000';
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      };

      await axios.patch(`${apiBaseUrl}/order/${orderId}/status`, { status }, { headers });
      toast.success(`Order ${status}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status.');
    }
  };

  if (!dateFns) return <div>Loading...</div>;

  return (<>
    <NavAdmin/>
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Admin Dashboard</h1>

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
          <FaUsers className="text-blue-500 text-3xl mr-4" />
          <div>
            <p className="text-gray-500">Total Users</p>
            <h2 className="text-2xl font-bold">{totalUsers ? totalUsers.toLocaleString() : '0'}</h2>
          </div>
        </div>
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

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Sales Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sales}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Users Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Users Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={users}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Section */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Order Management</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Order ID: {order._id}</h3>
              <p className="text-gray-600">User: {order.userId.email}</p>
              <p className="text-gray-600">Status: {order.status}</p>
              <div className="mt-4 flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleOrderStatusChange(order._id, 'Placed')}
                >
                  Place Order
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => handleOrderStatusChange(order._id, 'Delivered')}
                >
                  Delivered
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleOrderStatusChange(order._id, 'Cancelled')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
 </> );
};

export default DashboardAdmin;
