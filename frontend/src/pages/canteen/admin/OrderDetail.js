import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../../../styles/canteen/orderDetail.css';

function OrderDetail() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/canteen/orders/${id}`);
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        toast.error('Failed to load order details');
        navigate('/canteen/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error loading order details');
      navigate('/canteen/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);
  
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`/api/canteen/orders/${id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setOrder(response.data.data);
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };
  
  const handlePaymentStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`/api/canteen/orders/${id}/payment`, {
        paymentStatus: newStatus
      });
      
      if (response.data.success) {
        setOrder(response.data.data);
        toast.success(`Payment status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (!order) {
    return <div className="error">Order not found</div>;
  }
  
  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h1>Order Details</h1>
        <button 
          className="btn-back"
          onClick={() => navigate('/canteen/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
      
      <div className="order-detail-content">
        <div className="order-info">
          <div className="order-info-section">
            <h2>Order Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{order._id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Order Date:</span>
                <span className="info-value">{formatDate(order.orderDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Pickup Time:</span>
                <span className="info-value">{formatDate(order.pickupTime)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          <div className="order-info-section">
            <h2>Customer Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.user.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{order.user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{order.user.role}</span>
              </div>
            </div>
          </div>
          
          <div className="order-info-section">
            <h2>Order Status</h2>
            <div className="status-controls">
              <div className="status-control">
                <label>Order Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`status-select status-${order.status.toLowerCase()}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="status-control">
                <label>Payment Status:</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  className={`payment-select payment-${order.paymentStatus.toLowerCase()}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="status-control">
                <label>Payment Method:</label>
                <span className="payment-method">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="order-info-section">
              <h2>Notes</h2>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}
        </div>
        
        <div className="order-items-section">
          <h2>Order Items</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">Total</td>
                <td>{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail; 