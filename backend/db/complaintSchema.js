const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String, required: true },
  urgencyLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
  photos: { type: [String], default: [] },
  consentForFollowUp: { type: Boolean, required: true },
  userEmail: { type: String, required: true },
  upvotedBy: { type: [String], default: [] },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;