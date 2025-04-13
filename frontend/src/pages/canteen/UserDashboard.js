import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import '../../styles/canteen/userDashboard.css';

function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only get available products
      const response = await axios.get('/api/canteen/products?available=true');
      
      if (response.data.success) {
        const availableProducts = response.data.data;
        setProducts(availableProducts);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(availableProducts.map(p => p.category))];
        setCategories(uniqueCategories);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProducts();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('canteenCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [fetchProducts]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('canteenCart', JSON.stringify(cart));
  }, [cart]);
  
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product is already in cart
      const existingItem = prevCart.find(item => item.product === product._id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        return prevCart.map(item => 
          item.product === product._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: 1
        }];
      }
    });
    
    toast.success(`Added ${product.name} to cart`);
  };
  
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product !== productId));
  };
  
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('canteenCart');
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Filter products by category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="canteen-user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome to the Canteen, {user?.name || 'Guest'}</h1>
        <p>Order delicious food from our canteen</p>
      </div>
      
      <div className="dashboard-content">
        <div className="products-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                  </div>
                  
                  <button 
                    className="btn-add-to-cart"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                  >
                    {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="cart-section">
          <div className="cart-header">
            <h2>Your Cart</h2>
            {cart.length > 0 && (
              <button className="btn-clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <p>Add items to place an order</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product} className="cart-item">
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>{formatCurrency(item.price)}</p>
                    </div>
                    
                    <div className="item-quantity">
                      <button 
                        className="btn-quantity"
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        className="btn-quantity"
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      <p>{formatCurrency(item.price * item.quantity)}</p>
                      <button 
                        className="btn-remove"
                        onClick={() => removeFromCart(item.product)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                
                <Link to="/canteen/checkout" className="btn-checkout">
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard; 