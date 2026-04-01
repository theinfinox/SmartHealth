const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION: Configured for your TiDB Cluster
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true // TiDB Cloud requires SSL
    }
});

// Test the pool connection on startup
db.getConnection((err, connection) => {
    if (err) { 
        console.error("TiDB Connection failed!", err.message); 
        return; 
    }
    console.log('Successfully connected to TiDB Cloud (test database).');
    connection.release();
});

// --- API ROUTES ---

app.post('/register-patient', (req, res) => {
    const { name, age, gender, phone } = req.body;
    const sql = "INSERT INTO Patients (Name, Age, Gender, Phone) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, age, gender, phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Registered!", newID: result.insertId });
    });
});

app.post('/register-doctor', (req, res) => {
    const { name, specialty } = req.body;
    const sql = "INSERT INTO Doctors (Name, Specialty) VALUES (?, ?)";
    db.query(sql, [name, specialty], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Doctor added!", newID: result.insertId });
    });
});

app.post('/save-vitals', (req, res) => {
    const { pid, heartRate, spo2 } = req.body;
    const sql = "INSERT INTO Vitals (PID, HeartRate, SpO2) VALUES (?, ?, ?)";
    db.query(sql, [pid, heartRate, spo2], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Vitals saved!" });
    });
});

app.post('/book-appointment', (req, res) => {
    const { pid, did, apptDate } = req.body;
    const sql = "INSERT INTO Appointments (PID, DID, ApptDate) VALUES (?, ?, ?)";
    db.query(sql, [pid, did, apptDate], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Appointment booked!" });
    });
});

app.get('/get-vitals', (req, res) => {
    const sql = "SELECT v.*, p.Name AS PatientName FROM Vitals v JOIN Patients p ON v.PID = p.PID ORDER BY LogTime DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/get-doctors', (req, res) => {
    db.query("SELECT * FROM Doctors", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/get-appointments', (req, res) => {
    const sql = "SELECT a.*, p.Name AS PatientName, d.Name AS DoctorName FROM Appointments a JOIN Patients p ON a.PID = p.PID JOIN Doctors d ON a.DID = d.DID";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- FRONTEND SERVING ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Replace the last line:
// app.listen(3000, () => console.log('Healthcare server is LIVE on http://localhost:3000'));

// With this:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Healthcare server is LIVE on port ${PORT}`));
