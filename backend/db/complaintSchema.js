const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    userEmail: { type: String, required: true },
    address: { type: String, required: true },
    panchayat: { type: String, required: true }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
