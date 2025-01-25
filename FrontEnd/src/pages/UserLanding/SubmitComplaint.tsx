import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitComplaint.css";

export function SubmitComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step-by-step form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    district: "",
    pincode: "",
    urgencyLevel: "Low",
    photos: [] as File[],
    consentForFollowUp: false,
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, photos: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.address ||
      !formData.district ||
      !formData.pincode
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all fields to FormData
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("district", formData.district);
      formDataToSend.append("pincode", formData.pincode);
      formDataToSend.append("urgencyLevel", formData.urgencyLevel);
      formDataToSend.append("consentForFollowUp", formData.consentForFollowUp.toString());

      // Append photos (if any)
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((file) => {
          formDataToSend.append("photos", file);
        });
      }

      const response = await fetch("http://localhost:3000/complaintSub", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Complaint submitted successfully!");
        navigate("/dashboard");
      } else {
        setError(data.msg || "Failed to submit complaint. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description;
      case 2:
        return formData.address && formData.district && formData.pincode;
      case 3:
        return true; // No validation needed for step 3
      default:
        return false;
    }
  };

  return (
    <div className="submit-complaint-container">
      <h1>Register New Complaint</h1>
      {error && <p className="error-message">{error}</p>}

      {/* Step Progress Indicator */}
      <div className="step-progress">
        <div className="step-indicator">
          Step {step} of 3
        </div>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step-by-step form */}
      {step === 1 && (
        <div className="form-step">
          <h2>Step 1: Basic Information</h2>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter complaint title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your complaint"
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!isStepValid()}
              className="next-button"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-step">
          <h2>Step 2: Location Details</h2>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter your district"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="pincode">Pincode</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Enter your pincode"
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="back-button"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!isStepValid()}
              className="next-button"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-step">
          <h2>Step 3: Additional Details</h2>
          <div className="form-group">
            <label htmlFor="urgencyLevel">Urgency Level</label>
            <select
              id="urgencyLevel"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="photos">Upload Photos (Max 5)</label>
            <input
              type="file"
              id="photos"
              name="photos"
              onChange={handleFileChange}
              multiple
              accept="image/*"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="consentForFollowUp"
                checked={formData.consentForFollowUp}
                onChange={(e) => setFormData({ ...formData, consentForFollowUp: e.target.checked })}
              />
              I consent to follow-up communication regarding this complaint.
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="back-button"
            >
              Back
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="submit-button"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}