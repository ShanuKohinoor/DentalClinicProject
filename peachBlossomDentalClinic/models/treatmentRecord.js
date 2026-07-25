import mongoose from "mongoose";

const treatmentRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dentist",
      required: true
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },

    toothNumber: {
      type: String, 
      required: false
    },

    diagnosis: {
      type: String, 
      required: true
    },

    procedure: {
      type: String, 
      default: ""
    },

    notes: {
      type: String,
      default: ""
    },
    prescription: {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String   
     }
  },
  
  { timestamps: true }
);

export const myTreatmentRecord = mongoose.model( "TreatmentRecord",treatmentRecordSchema);