import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/canteen/checkout.css';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    paymentMethod: 'Cash',
    notes: '',
    pickupTime: ''
  });
  const [loading, setLoading] = useState(false);
  
  // We'll use the user info in the future for personalization
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('canteenCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Redirect if cart is empty
      navigate('/canteen/dashboard');
      toast.error('Your cart is empty');
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Calculate the total amount
      const totalAmount = calculateTotal();
      
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          product: item._id || item.product,
          quantity: item.quantity
        })),
        totalAmount: totalAmount,
        ...formData
      };
      
      const response = await axios.post('/api/canteen/orders', orderData);
      
      if (response.data.success) {
        // Clear cart
        localStorage.removeItem('canteenCart');
        
        toast.success('Order placed successfully!');
        navigate('/canteen/orders');
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate pickup time options (every 15 minutes for the next 3 hours)
  const generatePickupTimeOptions = () => {
    const options = [];
    const now = new Date();
    const startTime = new Date(now);
    startTime.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    
    for (let i = 0; i < 12; i++) {
      const time = new Date(startTime);
      time.setMinutes(startTime.getMinutes() + (i * 15));
      
      const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoTime = time.toISOString();
      
      options.push({ label: formattedTime, value: isoTime });
    }
    
    return options;
  };
  
  const pickupTimeOptions = generatePickupTimeOptions();
  
  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="order-items">
            {cart.map(item => (
              <div key={item.product} className="order-item">
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>{item.quantity} × {formatCurrency(item.price)}</p>
                </div>
                <p className="item-total">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="order-total">
            <span>Total:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
        
        <div className="checkout-form-container">
          <h2>Order Details</h2>
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="pickupTime">Pickup Time</label>
              <select
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
              >
                <option value="">Select Pickup Time</option>
                {pickupTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="Cash">Cash on Pickup</option>
                <option value="Online">Online Payment</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Special Instructions (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions for your order..."
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-back"
                onClick={() => navigate('/canteen/dashboard')}
              >
                Back to Menu
              </button>
              <button 
                type="submit" 
                className="btn-place-order"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout; 