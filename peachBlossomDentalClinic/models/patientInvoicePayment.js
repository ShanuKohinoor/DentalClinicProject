import mongoose from "mongoose";

const patientInvoicePaymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 1,
    },

    method: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Bank Transfer"],
      required: true,
    },

    transactionId: {
      type: String, // UPI/Card ref number
      default: null,
    },

    note: {
      type: String,
      default: "",
    },

    receivedBy: {
      type: String, // admin name
      default: "Admin",
    },
  },
  { timestamps: true }
);

export const myPatientInvoicePayment = mongoose.model(
  "PatientInvoicePayment",
  patientInvoicePaymentSchema
);