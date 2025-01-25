import React from "react";
import "./NavNav.css"; 
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export function NavNav() {
  return (
    <header className="nav-container fixed-header">
      {/* Top bar */}
      <div className="top-bar">
        <div className="logo"> {/* Placeholder for logo */}
          <img src={logo} alt="Site Logo" />
        </div>
        <div className="language-selector">
          <label htmlFor="language">Change Language:</label>
          <select id="language" className="language-dropdown">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="od">Odia</option>
          </select>
        </div>
      </div>
    </header>
  );
}
