const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./db/userSchema');
const Admin = require('./db/adminSchema');
const connectDB = require('./db/connections');
const Complaint = require('./db/complaintSchema');
const { z } = require('zod');
const PORT = 3000;
const app = express();
app.use(express.json());
connectDB();
const JWT_PASS = "123321";

const checkAuth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }

    // Verify the token
    jwt.verify(token, JWT_PASS, (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: "Invalid or expired token" });
        }
        req.user = decoded;
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
        // Generate JWT token
        const token = jwt.sign({ email: existingUser.email, name: existingUser.name }, JWT_PASS,{ expiresIn: '1h' });
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

// Complaint
app.post("/complaintSub", async (req, res) => {
    const { title, description, category } = req.body;
    try {
        const newComplaint = new Complaint({
            title,
            description,
            category,
            userEmail: req.user.email  // Link complaint to the user by email for future calls
        });

        await newComplaint.save();
        res.status(201).json({ msg: 'Complaint submitted successfully!', complaint: newComplaint });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
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

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
