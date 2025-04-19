import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Student Management</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Students List</Link>
          <Link className="nav-link" to="/add">Add Student</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;