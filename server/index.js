const express = require('express');
const cors = require('cors');
const { uploadsDir } = require('./db');

const authRoutes = require('./routes/authRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testsRoutes = require('./routes/testsRoutes');
const assignmentsRoutes = require('./routes/assignmentsRoutes');

const app = express();
const PORT = 3001;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api', authRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/assignments', assignmentsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

