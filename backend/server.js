const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./db/userSchema');
const Admin = require('./db/adminSchema');
const connectDB = require('./db/connections');
const Complaint = require('./db/complaintSchema');
const cors = require('cors'); 
const { z } = require('zod');
require('dotenv').config();
const sendEmail = require("./emailservices");


const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Something went wrong!' });
});

const JWT_PASS = process.env.JWT_SECRET; // Use JWT secret from .env
const PORT = process.env.PORT || 3000; 

const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token after "Bearer"
    
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "Invalid or expired token" });
      }
      req.user = decoded; // Attach decoded user data to request
      next();
    });
  };

// Landing
app.get("/", (req, res) => {
    res.send("Hey There!");
});

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

// SignIn
app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser.password === password) {
        // Corrected to use username
        const token = jwt.sign(
          { email: existingUser.email, username: existingUser.username }, 
          JWT_PASS,
          { expiresIn: '1h' }
        );
        return res.status(200).json({ msg: "Welcome back!", token: token });
    } else {
        return res.status(400).send("Invalid credentials");
    }
});

//SignUp
app.post("/signup", async (req, res) => {
    try {
        // Validate request
        const validatedData = signupSchema.parse(req.body);

        const { username, email, password } = validatedData;

        // Check exitsing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // New user
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ msg: 'User registered successfully!' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Validation error
            return res.status(400).json({ msg: 'Validation error', errors: error.errors });
        }
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { z: schemaValidator } = require('zod'); 

const complaintSchema = schemaValidator.object({
    title: schemaValidator.string().min(3),
    description: schemaValidator.string().min(10),
    category: schemaValidator.string().min(3),
    address: schemaValidator.string().min(5),
    district: schemaValidator.string().min(3),
    pincode: schemaValidator.string().min(6),
    urgencyLevel: schemaValidator.string()
});

app.post("/complaintSub", checkAuth, upload.array('photos'), async (req, res) => {
    try {
      const { title, description, category, address, district, pincode, urgencyLevel, consentForFollowUp } = req.body;
      const photos = req.files?.map(file => file.path) || [];

      const newComplaint = new Complaint({
        title,  
        description,
        // category,
        address,
        district,
        pincode,
        urgencyLevel,
        photos,
        consentForFollowUp,
        userEmail: req.user.email
      });

      await newComplaint.save();
      res.status(201).json({ msg: "Complaint submitted!", complaint: newComplaint });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
});

// Get all user specific complaints
app.get("/user/complaints", checkAuth, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const complaints = await Complaint.find({ userEmail });

        if (complaints.length === 0) {
            return res.status(404).json({ msg: "No complaints found for this user." });
        }
        
        res.status(200).json({ msg: "Complaints retrieved successfully!", complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

//Delete User Specific Complaints
app.delete("/user/complaints/:id", checkAuth, async (req, res) => {
    const complaintId = req.params.id;

    try {
        const deletedComplaint = await Complaint.findOneAndDelete({
            _id: complaintId,
            userEmail: req.user.email
        });

        if (!deletedComplaint) {
            return res.status(404).json({ msg: "Complaint not found or access denied" });
        }

        res.status(200).json({ msg: "Complaint deleted successfully!", complaint: deletedComplaint });
    } catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});


// Get all complaints
app.get("/complaints", async (req, res) => {
    try {
        const complaints = await Complaint.find();

        if (complaints.length === 0) {
            return res.status(404).json({ msg: "No complaints found." });
        }

        res.status(200).json({ msg: "Complaints retrieved successfully!", complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});


// Upvote complaint
app.put("/complaints/:id/upvote", checkAuth, async (req, res) => {
    try {
      const complaintId = req.params.id;
      const userEmail = req.user.email;
      const complaint = await Complaint.findById(complaintId);
  
      if (!complaint) {
        return res.status(404).json({ msg: "Complaint not found" });
      }
      // Check if the user has already upvoted
      if (complaint.upvotedBy.includes(userEmail)) {
        return res.status(400).json({ msg: "You have already upvoted this complaint" });
      }
      complaint.upvotedBy.push(userEmail);
      complaint.upvotes += 1;
      await complaint.save();
  
      res.status(200).json(complaint);
    } catch (error) {
      console.error("Error upvoting:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });

// // ADMIN // //
// Admin Authentication
const checkAdminAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }

    jwt.verify(token, JWT_PASS, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied" });
        }
        req.admin = decoded; 
        next();
    });
};

// Admin Signup
app.post('/admin/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ msg: 'Admin already exists' });
        }
        const newAdmin = new Admin({ username, email, password });
        await newAdmin.save();

        res.status(201).json({ msg: 'Admin registered successfully!' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Admin Signin
app.post('/admin/signin', async (req, res) => {
    const email  = req.body.email;
    const password = req.body.password;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin || admin.password !== password) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        const token = jwt.sign({ email: admin.email, role: 'admin' }, JWT_PASS, { expiresIn: '1h' });
        res.status(200).json({ msg: 'Welcome, Admin!', token });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Admin Get all Complaints
app.get("/admin/complaints", checkAdminAuth, async (req, res) => {
    try {
        const complaints = await Complaint.find();

        if (complaints.length === 0) {
            return res.status(404).json({ msg: "No complaints found." });
        }

        res.status(200).json({ msg: "Complaints retrieved successfully!", complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Admin Delete Privilage
app.delete('/admin/complaints/:id', checkAdminAuth, async (req, res) => {
    const complaintId = req.params.id;
    try {
        const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);
        if (!deletedComplaint) {
            return res.status(404).json({ msg: "Complaint not found" });
        }
        res.status(200).json({ msg: "Complaint deleted successfully!", complaint: deletedComplaint });
    } catch (error) {
        console.error("Error deleting complaint:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Sync Offline Complaints
app.post('/complaints/sync', async (req, res) => {
    const complaints = req.body.complaints;
    if (!Array.isArray(complaints) || complaints.length === 0) {
        return res.status(400).json({ msg: "No complaints provided for sync." });
    }
    try {
        const insertedComplaints = [];
        for (const complaint of complaints) {
            const { title, description, category, userEmail, address, panchayat, district, pincode, urgencyLevel, consentForFollowUp } = complaint;
            // if (!district || !pincode || !urgencyLevel || consentForFollowUp === undefined) {
            //     return res.status(400).json({ msg: "Missing required fields: district, pincode, urgencyLevel, or consentForFollowUp" });
            // }
            const newComplaint = new Complaint({
                title,
                description,
                category,
                userEmail,
                address,
                panchayat,
                district,
                pincode,
                urgencyLevel,
                consentForFollowUp,
            });
            const savedComplaint = await newComplaint.save();
            insertedComplaints.push(savedComplaint);
        }
        res.status(201).json({
            msg: "Complaints synced successfully!",
            syncedComplaints: insertedComplaints,
        });
    } catch (error) {
        console.error("Error syncing complaints:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Send Mail
app.put("/complaints/:id/status", async (req, res) => {
    const complaintId = req.params.id;
    const { status } = req.body;
    // Validate the status field
    if (!status) {
        return res.status(400).json({ msg: "Status field is required." });
    }
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ msg: "Complaint not found." });
        }

        // Update the complaint status
        complaint.status = status;
        await complaint.save();

        // Send email notification if status is "completed"
        if (status.toLowerCase() === "completed") {
            const emailText = `Hello,\n\nYour complaint titled "${complaint.title}" has been marked as "completed".\n\nThank you for using our service!`;
            await sendEmail(complaint.userEmail, "Complaint Status Updated", emailText);
        }

        res.status(200).json({ msg: "Complaint status updated successfully!" });
    } catch (error) {
        console.error("Error updating complaint status:", error);
        res.status(500).json({ msg: "Internal server error." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
