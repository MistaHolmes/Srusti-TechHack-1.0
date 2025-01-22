const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
// const userSchema = require('./db.js');
const JWT_PASS = "123321"
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {timestamps: true});
const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb+srv://user:user@cluster0.vqxq4.mongodb.net/myDatabase');

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Hey There!");
});

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});


app.post("/signin", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser && existingUser.password === password) {
        // Generate JWT token
        const token = jwt.sign({ email: existingUser.email, name: existingUser.name }, JWT_PASS);
        return res.status(200).json({ msg: "Welcome back!", token: token });
    } else {
        return res.status(400).send("Invalid credentials");
    }
});

app.post("/signup", async (req, res) => {
    try {
        // Validate request
        const validatedData = signupSchema.parse(req.body);

        const { username, email, password } = validatedData;

        // Check exitsing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // New user
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Validation error
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
