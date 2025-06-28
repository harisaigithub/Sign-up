const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); // Add this line
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// MongoDB connection (replace with your actual connection string)
mongoose.connect('mongodb+srv://harisai9581912835:0z5zpRWyxUI3aDBq@cluster0.qdt5joe.mongodb.net/user_data?retryWrites=true&w=majority', {
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
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// MongoDB schema and model
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    mobileNumber: String,
    email: String,
    password: String,
    age: Number,
});
const User = mongoose.model('User', userSchema);

// Endpoint to handle storing the user data
app.post('/storeData', (req, res) => {
    const userData = req.body;

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(userData.mobileNumber)) {
        return res.status(400).json({ error: 'Invalid mobile number. Must be 10 digits.' });
    }

    const newUser = new User(userData);

    newUser.save()
        .then(() => res.status(200).json({ message: 'Data stored successfully' }))
        .catch((err) => res.status(500).json({ error: 'Failed to store data', err }));
});

// Endpoint to view all stored data (admin page)
app.get('/viewData', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ error: 'Failed to fetch data', err }));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
