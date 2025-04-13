import React from 'react';
import { Outlet } from 'react-router-dom';
import CanteenNavbar from './CanteenNavbar';
import '../../styles/canteen/canteenLayout.css';

function CanteenLayout() {
  return (
    <div className="canteen-layout">
      <CanteenNavbar />
      <main className="canteen-main-content">
        <Outlet />
      </main>
      <footer className="canteen-footer">
        <p>&copy; {new Date().getFullYear()} Campus Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default CanteenLayout; 