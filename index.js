import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
const app = express();

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define MongoDB schemas and models
const ServiceSchema = new mongoose.Schema({
  name: String,
  doctorName: String,
});

const BookingSchema = new mongoose.Schema({
  patientName: String,
  phone: String,
  date: Date,
  service: String,
  doctor: String,
});

const Service = mongoose.model('Service', ServiceSchema);

const Booking = mongoose.model('Booking', BookingSchema);

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Add a new service
app.post('/services', async (req, res) => {
  try {
    const { name, doctorName } = req.body;

    if (!name || !doctorName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(400).json({ message: 'Service already exists' });
    }

    const existDoctor = await Service.findOne({ doctorName: doctorName });

    if (existDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const service = new Service({ name, doctorName });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List all services
app.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all bookings ordered by the latest date
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/bookings', async (req, res) => {
  try {
    const { patientName, phone, date, service, doctor } = req.body;

    if (!patientName || !phone || !date || !service || !doctor) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = new Booking({
      patientName,
      phone,
      date,
      service,
      doctor,
    });

    await booking.save();
    return res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
