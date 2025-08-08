const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cases', require('./routes/cases')); // Add this line
app.use('/api', require('./routes/comments'));
app.use('/api', require('./routes/caseComments')); // Add this line

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Social Care 365 API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    database: 'Connected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Social Care 365 API running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
}); 