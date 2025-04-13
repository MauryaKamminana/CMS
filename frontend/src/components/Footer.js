import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>College Utility System</h3>
            <p>A comprehensive platform for managing college resources, assignments, and communications.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/announcements">Announcements</a></li>
              <li><a href="/lost-items">Lost & Found</a></li>
              <li><a href="/resources">Resources</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: support@collegeutility.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} College Utility System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 