require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./utils/errorHandler');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Check for Hugging Face API key
if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('HUGGINGFACE_API_KEY is not set in the environment variables');
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use('/api/chat', chatRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Database connection and server start
sequelize.sync({ force: false }) // Set to true if you want to reset the database on each startup
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Hugging Face API Key: ${process.env.HUGGINGFACE_API_KEY ? 'Set' : 'Not Set'}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully');
    sequelize.close().then(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

module.exports = app;