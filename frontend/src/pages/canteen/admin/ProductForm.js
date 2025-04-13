import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../../utils/axiosConfig';
import '../../../styles/canteen/productForm.css';

function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    quantity: '',
    isAvailable: true
  });
  
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use useCallback to memoize the fetchProduct function
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/canteen/products/${id}`);
      
      if (response.data.success) {
        const product = response.data.data;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          quantity: product.quantity,
          isAvailable: product.isAvailable
        });
      } else {
        toast.error('Failed to load product');
        navigate('/canteen/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product');
      navigate('/canteen/admin/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchProduct();
    }
  }, [id, fetchProduct]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.quantity) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // Convert price and quantity to numbers
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10)
      };
      
      let response;
      
      if (isEdit) {
        response = await axios.put(`/api/canteen/products/${id}`, productData);
      } else {
        response = await axios.post('/api/canteen/products', productData);
      }
      
      if (response.data.success) {
        toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/canteen/admin/products');
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} product:`, error);
      toast.error(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'creating'} product`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return <div className="loading">Loading product...</div>;
  }
  
  return (
    <div className="product-form-container">
      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter product description"
            rows="4"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (₹)*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Quantity*</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category*</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snacks">Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
          />
          <label htmlFor="isAvailable">Available for ordering</label>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/canteen/admin/products')}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm; 