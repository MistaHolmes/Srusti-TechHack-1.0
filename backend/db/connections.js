const mongoose = require('mongoose');

const connectDB = async () => {
    try {
<<<<<<< HEAD
        await mongoose.connect('mongodb+srv://theogadityahota:Iamspeed%402003@cluster0.rlyi7.mongodb.net/myDatabase', {
=======
        await mongoose.connect('mongodb+srv://user:<password>@cluster0.vqxq4.mongodb.net/myDatabase', {
>>>>>>> 45ccceaad6bad589aa315d1e26061ec71d6008f3
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    }
};

module.exports = connectDB;
