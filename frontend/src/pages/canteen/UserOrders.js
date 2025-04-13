import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import '../../styles/canteen/userOrders.css';

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/canteen/orders/my-orders');
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
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
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'ready':
        return 'status-ready';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  return (
    <div className="user-orders-container">
      <h1>My Orders</h1>
      
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/canteen/dashboard" className="btn-order-now">
            Order Now
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span>Order ID:</span>
                  <span>{order._id.substring(0, 8)}...</span>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="order-details">
                <div className="order-meta">
                  <p><strong>Ordered:</strong> {formatDate(order.orderDate)}</p>
                  <p><strong>Pickup Time:</strong> {formatDate(order.pickupTime)}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>
                
                <div className="order-items">
                  <h3>Items</h3>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-total">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                
                {order.notes && (
                  <div className="order-notes">
                    <h3>Notes</h3>
                    <p>{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="orders-footer">
        <Link to="/canteen/dashboard" className="btn-back-to-menu">
          Back to Menu
        </Link>
      </div>
    </div>
  );
}

export default UserOrders; 