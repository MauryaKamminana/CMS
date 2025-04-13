import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../utils/axiosConfig';
import '../../../styles/canteen/adminDashboard.css';

function CanteenAdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get products stats
      const productsRes = await axios.get('/api/canteen/products');
      const products = productsRes.data.data;
      
      // Get orders
      const ordersRes = await axios.get('/api/canteen/orders');
      const orders = ordersRes.data.data;
      
      // Calculate stats
      const availableProducts = products.filter(p => p.isAvailable && p.quantity > 0).length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter(o => new Date(o.orderDate) >= today);
      const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
      
      const todayRevenue = todayOrders.reduce((total, order) => total + order.totalAmount, 0);
      
      setStats({
        totalProducts: products.length,
        availableProducts,
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        todayRevenue
      });
      
      // Get recent orders
      setRecentOrders(orders.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  return (
    <div className="canteen-admin-dashboard">
      <h1>Canteen Admin Dashboard</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
          <p className="stat-subtext">{stats.availableProducts} available</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
          <p className="stat-subtext">{stats.pendingOrders} pending</p>
        </div>
        
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p className="stat-value">{stats.todayOrders}</p>
          <p className="stat-subtext">{formatCurrency(stats.todayRevenue)} revenue</p>
        </div>
      </div>
      
      <div className="quick-actions">
        <Link to="/canteen/admin/products" className="action-btn">
          Manage Products
        </Link>
        <Link to="/canteen/admin/orders" className="action-btn">
          View All Orders
        </Link>
        <Link to="/canteen/admin/products/new" className="action-btn">
          Add New Product
        </Link>
      </div>
      
      <div className="recent-orders">
        <h2>Recent Orders</h2>
        
        {recentOrders.length === 0 ? (
          <p>No recent orders</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{order.user.name}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/canteen/admin/orders/${order._id}`} className="view-btn">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="view-all">
          <Link to="/canteen/admin/orders">View All Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default CanteenAdminDashboard; 