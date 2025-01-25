import React, { useEffect, useState } from "react";
import { NavNav } from "../../components/NavNav";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  upvotes: number;
  createdAt: string;
  userEmail: string; // Add userEmail to the interface
}

export function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMostUpvoted, setShowMostUpvoted] = useState(false); // State to toggle sorting
  const [showUserComplaints, setShowUserComplaints] = useState(false); // State to toggle user-specific complaints

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");

    // Fetch complaints
    const fetchComplaints = async () => {
      try {
        const response = await fetch("http://localhost:3000/complaints");
        const data = await response.json();
        setComplaints(data.complaints); // Now matches server response
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

  const handleUpvote = async (complaintId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/complaints/${complaintId}/upvote`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setComplaints((prevComplaints) =>
          prevComplaints.map((complaint) =>
            complaint._id === complaintId
              ? { ...complaint, upvotes: complaint.upvotes + 1 }
              : complaint
          )
        );
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  // Function to sort complaints by upvotes
  const sortComplaintsByUpvotes = () => {
    const sortedComplaints = [...complaints].sort((a, b) => b.upvotes - a.upvotes);
    setComplaints(sortedComplaints);
    setShowMostUpvoted(true); // Set the state to indicate sorting is applied
  };

  // Function to reset sorting (show original order)
  const resetSorting = () => {
    const originalOrder = [...complaints].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setComplaints(originalOrder);
    setShowMostUpvoted(false); // Reset the state
  };

  // Function to fetch user-specific complaints
  const fetchUserComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:3000/user/complaints", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setComplaints(data.complaints); // Set user-specific complaints
      setShowUserComplaints(true); // Enable user-specific complaints view
    } catch (error) {
      console.error("Error fetching user complaints:", error);
    }
  };

  // Function to reset to all complaints
  const resetToAllComplaints = async () => {
    try {
      const response = await fetch("http://localhost:3000/complaints");
      const data = await response.json();
      setComplaints(data.complaints); // Reset to all complaints
      setShowUserComplaints(false); // Disable user-specific complaints view
    } catch (error) {
      console.error("Error fetching all complaints:", error);
    }
  };

  return (
    <div>
      <NavNav />
      <div className="dashboard-container">
        {/* Buttons above the heading */}
        <div className="dashboard-actions">
          <button
            onClick={() => navigate("/submit-complaint")}
            className="register-complaint-btn"
          >
            Register New Complaint
          </button>
          {showMostUpvoted ? (
            <button onClick={resetSorting} className="sort-button">
              Show All Complaints
            </button>
          ) : (
            <button onClick={sortComplaintsByUpvotes} className="sort-button">
              Show Most Upvoted
            </button>
          )}
          {showUserComplaints ? (
            <button onClick={resetToAllComplaints} className="sort-button">
              Show All Complaints
            </button>
          ) : (
            <button onClick={fetchUserComplaints} className="sort-button">
              Show My Complaints
            </button>
          )}
        </div>

        {/* Centered heading */}
        <h1 className="dashboard-heading">📈Trading Complaints</h1>
        <br></br>
        {loading ? (
          <p>Loading complaints...</p>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-content">
                  <h3>{complaint.title}</h3>
                  <p>{complaint.description}</p>
                  <div className="complaint-meta">
                    <span>Category: {complaint.category}</span>
                    <span>
                      Created: {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="upvote-section">
                  <button
                    onClick={() => handleUpvote(complaint._id)}
                    className="upvote-btn"
                  >
                    ⬆️Upvote
                  </button>
                  <span className="upvote-count">{complaint.upvotes}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}