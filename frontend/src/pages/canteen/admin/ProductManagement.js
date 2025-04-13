import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../../utils/axiosConfig";
import "../../../styles/canteen/productManagement.css";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "",
    search: "",
    available: "",
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.search) params.append("search", filter.search);
      if (filter.available) params.append("available", filter.available);

      const response = await axios.get(
        `/api/canteen/products?${params.toString()}`
      );

      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.delete(`/api/canteen/products/${id}`);

        if (response.data.success) {
          toast.success("Product deleted successfully");
          fetchProducts();
        } else {
          toast.error("Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Error deleting product");
      }
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="product-management-container">
      <div className="product-management-header">
        <h1 style={{ paddingBottom: "20px" }}>Product Management</h1>
        <Link to="/canteen/admin/products/new" className="btn-add-product">
          Add New Product
        </Link>
      </div>

      <div className="product-filters">
        <div className="filter-group">
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filter.search}
            onChange={handleFilterChange}
            placeholder="Search products..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snacks">Snacks</option>
            <option value="Beverages">Beverages</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="available">Availability:</label>
          <select
            id="available"
            name="available"
            value={filter.available}
            onChange={handleFilterChange}
          >
            <option value="">All Products</option>
            <option value="true">Available Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found.</p>
          <Link to="/canteen/admin/products/new" className="btn-add-product">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
                {!product.isAvailable && (
                  <div className="unavailable-badge">Unavailable</div>
                )}
              </div>

              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{formatCurrency(product.price)}</p>
                <p className="product-quantity">
                  Quantity: {product.quantity}{" "}
                  {product.quantity === 0 && (
                    <span className="out-of-stock">(Out of Stock)</span>
                  )}
                </p>
              </div>

              <div className="product-actions">
                <Link
                  to={`/canteen/admin/products/${product._id}/edit`}
                  className="btn-edit"
                >
                  Edit
                </Link>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
