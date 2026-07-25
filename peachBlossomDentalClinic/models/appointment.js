// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required:true
  },
  patientType: { 
    type: String, 
    enum: ["new", "existing"],
    required: false
 },
  name: {
     type: String,
      required: true 
 },
  phone: { 
    type: String, 
    required: false 
 },
  email: { 
    type: String, 
    required: true 
 },
  appointmentDate: { 
    type: Date, 
    required: true 
 }, 
  appointmentTime: {
     type: String, 
     required: true 
 },
 doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
 },
 treatment: {
   type: String,
   required: true
 },
  status: {
     type: String,
     enum: ['Scheduled', 'Confirmed','Completed','Cancelled'], 
     default: "Scheduled" },
  createdAt: {
     type: Date,
      default: Date.now 
 },
   paymentStatus: {
    type: String,
    default: 'Pending'
  }
}, { timestamps: true 

});



appointmentSchema.index(
  { patient: 1, doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true }
);
export const myAppointment = mongoose.model('Appointment', appointmentSchema)
