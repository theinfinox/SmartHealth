const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'leo123', // Make sure this is your ACTUAL password
    database: 'SmartHealthDB'
});

db.connect(err => {
    if (err) { console.error("Database connection failed!", err); return; }
    console.log('Connected to SmartHealthDB.');
});

// ROUTE 1: Register Patient
app.post('/register-patient', (req, res) => {
    const { name, age, gender, phone } = req.body;
    const sql = "INSERT INTO Patients (Name, Age, Gender, Phone) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, age, gender, phone], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Registered!", newID: result.insertId });
    });
});

// ROUTE 2: Register Doctor
app.post('/register-doctor', (req, res) => {
    const { name, specialty } = req.body;
    const sql = "INSERT INTO Doctors (Name, Specialty) VALUES (?, ?)";
    db.query(sql, [name, specialty], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Doctor added!", newID: result.insertId });
    });
});

// ROUTE 3: Save Vitals
app.post('/save-vitals', (req, res) => {
    const { pid, heartRate, spo2 } = req.body;
    const sql = "INSERT INTO Vitals (PID, HeartRate, SpO2) VALUES (?, ?, ?)";
    db.query(sql, [pid, heartRate, spo2], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Vitals saved!");
    });
});

// ROUTE 4: Book Appointment
app.post('/book-appointment', (req, res) => {
    const { pid, did, apptDate } = req.body;
    const sql = "INSERT INTO Appointments (PID, DID, ApptDate) VALUES (?, ?, ?)";
    db.query(sql, [pid, did, apptDate], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Appointment booked!");
    });
});

// ROUTE 5: Get Vitals (For the feed)
app.get('/get-vitals', (req, res) => {
    const sql = "SELECT v.*, p.Name AS PatientName FROM Vitals v JOIN Patients p ON v.PID = p.PID ORDER BY LogTime DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Get Doctors
app.get('/get-doctors', (req, res) => {
    db.query("SELECT * FROM Doctors", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Get Appointments
app.get('/get-appointments', (req, res) => {
    const sql = "SELECT a.*, p.Name AS PatientName, d.Name AS DoctorName FROM Appointments a JOIN Patients p ON a.PID = p.PID JOIN Doctors d ON a.DID = d.DID";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.listen(3000, () => console.log('Healthcare server is LIVE on http://localhost:3000'));