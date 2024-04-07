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
  description: String,
  duration: Number,
});

const DoctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
});

const BookingSchema = new mongoose.Schema({
  patientName: String,
  phone: String,
  date: Date,

  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
});

const Service = mongoose.model('Service', ServiceSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Add a new service
app.post('/services', async (req, res) => {
  try {
    const { name, description, duration } = req.body;
    const service = new Service({ name, description, duration });
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

// Add a new doctor with respective services
app.post('/doctors', async (req, res) => {
  try {
    const { name, specialization, services } = req.body;
    const doctor = new Doctor({ name, specialization, services });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List all doctors with respective services
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('services');
    res.json(doctors);
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
      bookingDate,
      time,
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
