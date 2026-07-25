import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import http from 'http';

import clinicRoutes from './routes/clinicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';

//import appointmentRoutes from './routes/appointmentRoutes.js';

import errorHandlingMiddleware from './middlewares/errorHandlings.js';

// Create app
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

// ES6  for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);     // In common.js __dirname is default.
                                                // but in ES6 module we have to manually fix it

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// HOME ROUTE
app.get('/', (req, res) => {
    res.render('pages/welcome', { 
        title: 'Peach Blossom Dental Care', 
        country: 'Birmingham' 
    });
});

// DataBase
mongoose.connect(process.env.MONGO_URI)
 .then(() => {
    console.log('MongoDB Connected Successfully');   
 })
 .catch((error) => {
   console.log('MongoDB connection error:', error);
 });

//app.use('/appointment', appointmentRoutes);

app.use('/clinic', clinicRoutes);
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/patient', patientRoutes);

// ERROR HANDLING MIDDLEWARE 
app.use(errorHandlingMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});