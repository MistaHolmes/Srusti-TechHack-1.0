import React from "react";
import "./testi.css"; // Import the CSS file

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Aishwarya Priyadarshini",
      role: "Farmer",
      feedback:
        "loved the community tab",
    },
    {
      id: 2,
      name: "Samiksha Sahoo",
      role: "Teacher",
      feedback:
        "I love how easy it is to register complaints and track their progress. Highly recommended!",
    },
    {
      id: 3,
      name: "Aditya Hota",
      role: "Farmer",
      feedback:
        "The user interface is clean and intuitive. It makes resolving issues a breeze",
    },
  ];

  return (
    <section className="testimonials-section">
      <h2 className="testimonials-title">What Our Users Say</h2>
      <p className="testimonials-subtitle">
        Hear from our satisfied customers about their experiences.
      </p>
      <div className="testimonials-grid">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <p className="testimonial-feedback">"{testimonial.feedback}"</p>
            <div className="testimonial-user">
              <h3 className="testimonial-name">{testimonial.name}</h3>
              <p className="testimonial-role">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}