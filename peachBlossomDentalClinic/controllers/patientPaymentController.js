import { myPatient } from "../models/patients.js";
import { myInvoice } from "../models/invoice.js";
import { myPatientInvoicePayment } from "../models/patientInvoicePayment.js";
import { BadRequestError,NotFoundError } from "../utils/error.js";


// To get patient payment details
export const getPaymentDetail = async (req, res, next) => {
  try {
    const payments = await myPatientInvoicePayment 
      .find()
      .populate('patient')
      .populate('appointment')
      .sort({ createdAt: -1 });

    let totalPaid = 0;
    let totalPending = 0;

    payments.forEach(p => {
      totalPaid += p.paidAmount || 0;
      totalPending += p.balance || 0;
    });

    res.render("pages/paymentDetail", {
      title: "Patient Payment Details",
      payments,
      totalPaid,
      totalPending
    });

  } catch (error) {
    next(error);
  }
};


// Get invoice by appointment 
export const getInvoiceByAppointment = async (req, res, next) => {
  try {
    const invoice = await myInvoice
      .findOne({ appointment: req.params.id })
      .populate("patient")
      .populate("appointment");


    if (!invoice) {
      return res.render("invoiceView", {
        title: "Invoice",
        invoice: null,
        message: "Invoice not generated yet for this appointment"
      });
    }


    res.render("pages/invoiceView", {
      title: "Invoice",
      invoice,
    });
  } catch (error) {    
    next(error);
  }
};


// Form to add patient payment
export const getAddPatientPaymentForm = async (req, res, next) => {
  try {
    const patient = await myPatient.findById(req.params.id);
      
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    res.render("pages/addPatientPayment", {
      title: "Add Payment",
      patient
    });

  } catch (error) {    
    next(error);
  }
};



// To post patient payment form
export const postAddPatientPayment = async (req, res, next) => {
  try {
    const { treatment, amount, paidAmount, paymentMethod } = req.body;

    if (!treatment || !amount) {
      throw new BadRequestError("Treatment and Amount required");
    }

    const amt = Number(amount);
    const paid = Number(paidAmount || 0);

    const balance = amt - paid;

    let status = "Pending";
    if (balance === 0) status = "Paid";
    else if (paid > 0) status = "Partial";

    const payment = new myPatientInvoicePayment({
      patient: req.params.id,
      treatment,
      amount: amt,
      paidAmount: paid,
      balance,
      paymentMethod,
      status
    });

    await payment.save();

    res.redirect("/admin/paymentDetails");

  } catch (error) {
    next(error);
  }
};

// To get sngle patient payment detail
export const getSinglePatientPayments = async (req, res, next) => {
  try {
    const patientId = req.params.id;
      console.log('params:',req.params.id);

    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

const invoices = await myInvoice
  .find({ patient: patientId })
  .populate("patient")
  .sort({ createdAt: -1 });

    res.render("pages/singlePatientPayments", {
      title: "Patient Payments",
      patient,
      invoices
    });

  } catch (error) {
        console.log('Error:',error.message);

    next(error);
  }
};


// INVOICE
// Get all invoices for a patient
export const getPatientInvoices = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    if (!patientId) {
      throw new BadRequestError("Patient ID missing");
    }

    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const invoices = await myInvoice
      .find({ patient: patientId })
      .sort({ createdAt: -1 });

    res.render("pages/patientInvoices", {
      title: "Patient Invoices",
      patient,
      invoices
    });

  } catch (error) {
    next(error);
  }
};


// Create invoice
export const postCreateInvoice = async (req, res, next) => {
  try {
    const { patientId, items, totalAmount } = req.body;

    if (!patientId) {
      throw new BadRequestError("Patient ID required");
    }

    if (!totalAmount) {
      throw new BadRequestError("Total amount required");
    }

    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    const invoice = new myInvoice({
      patient: patientId,
      items: items || [],
      totalAmount: Number(totalAmount),
      paidAmount: 0,
      balance: Number(totalAmount),
      status: "Pending"
    });

    await invoice.save();

    res.redirect(`/admin/patient/${patientId}/invoices`);

  } catch (error) {
    next(error);
  }
};


// Pay invoice
export const postPayInvoice = async (req, res, next) => {
  try {

    const invoice = await myInvoice.findById(req.params.id);

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    const paid = Number(req.body.amount);

    if (isNaN(paid) || paid <= 0) {
      throw new BadRequestError("Invalid payment amount");
    }

    invoice.paidAmount += paid;
    invoice.balance = invoice.totalAmount - invoice.paidAmount;

    if (invoice.balance <= 0) {
      invoice.status = "Paid";
      invoice.balance = 0;
    } else {
      invoice.status = "Partial";
    }

    await invoice.save();

    await myPatientInvoicePayment.create({
      invoice: invoice._id,
      patient: invoice.patient,
      amountPaid: paid,
      method: "Cash"
    });

    res.redirect(`/admin/appointment/${invoice.appointment}/invoice`);

  } catch (error) {
    next(error);
  }
};

// All invoice payments
export const getInvoicePayments = async (req, res, next) => {
  try {
    const payments = await myPatientInvoicePayment
      .find()
      .populate("patient")
      .populate("invoice")
      .sort({ createdAt: -1 });

    res.render("pages/invoicePayments", {
      title: "Invoice Payments",
      payments
    });

  } catch (error) {
    next(error);
  }
};


// To getall invoices
export const getAllInvoices = async (req, res, next) => {
  try {

    console.log('Hitting error');
    
    const invoices = await myInvoice
      .find()
      .populate("patient")
      .sort({ createdAt: -1 });

    res.render("pages/allInvoices", {
      title: "All Invoices",
      invoices
    });

  } catch (error) {
    console.log('Error:',error.message)
    next(error);
  }
};