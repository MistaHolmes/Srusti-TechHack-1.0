import React from "react";
import "./Footer.css"; // Import the CSS file
import facebook from "../assets/facebook.png";
import twitter from "../assets/twitter.png";
import instagram from "../assets/instagram.png";

export function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Social media links */}
        <div className="social-links">
          <a href="#" className="social-icon">
            <img src={facebook} alt="Facebook" />
          </a>
          <a href="#" className="social-icon">
            <img src={twitter} alt="Twitter" />
          </a>
          <a href="#" className="social-icon">
            <img src={instagram} alt="Instagram" />
          </a>
        </div>

        {/* Quick links as buttons */}
        <div className="quick-links">
          <a href="#about" className="footer-button">About Us</a>
          <a href="#privacy" className="footer-button">Privacy Policy</a>
          <a href="#terms" className="footer-button">Terms of Service</a>
          <a href="#contact" className="footer-button">Contact Us</a>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2025 Primeagen Complaint Portal. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}


