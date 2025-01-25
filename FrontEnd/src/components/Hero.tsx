import React from "react";
import "./Hero.css"; 
import heroimg from "../assets/heroimg.jpeg";

export function Hero() {
  return (
    <section className="hero-container">
      <div className="hero-bg">
        <img
          src={heroimg}
          alt="Hero Background"
          className="hero-image"
        />
      </div>

      {/* Hero content */}
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Our Complaint Portal</h1>
        <p className="hero-subtitle">
          Your voice matters. File your complaints and make a difference today!
        </p>
      </div>
    </section>
  );
}
