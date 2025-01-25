import React from "react";
import "./sevis.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";

export function RegisterSection() {
  const navigate = useNavigate();

  return (
    <section className="register-section">
      <div className="register-content">
        <h2 className="register-title">Register Complaint Now</h2>
        <p className="register-description">
          Join us to resolve your issues quickly and efficiently. Whether you're a new user or an existing one, we're here to help!
        </p>
        <div className="register-buttons">
          <button
            onClick={() => navigate("/login")}
            className="register-button main-login-button"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="register-button main-signup-button"
          >
            Sign Up
          </button>
        </div>

      </div>
    </section>
  );
}