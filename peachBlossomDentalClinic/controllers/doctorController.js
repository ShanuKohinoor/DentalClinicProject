import { myDentist } from "../models/doctors.js";
import { drNotification } from "../models/treatmentCompletedNotification.js";


import { myPayment } from "../models/doctorPayment.js"; 
import { createDoctorToken } from "../utils/doctorToken.js";
import { NotFoundError } from "../utils/error.js";
import { myAppointment } from "../models/appointment.js";

import { myPatient } from "../models/patients.js";
import { myTreatmentRecord } from "../models/treatmentRecord.js";




// DOCTOR LOGIN 

export const getDoctorLogin = (req, res) => {
    res.render('pages/doctorLogin');
};


// LOGIN POST

export const postDoctorLogin = async (req, res, next) => {
    try {
        const { email } = req.body;

        const dentist = await myDentist.findOne({ email });

        if (!dentist) {
            throw new NotFoundError('Doctor Not Found');
        }

        const token = createDoctorToken(dentist);

        res.cookie('dentistToken', token, {
            httpOnly: true,
            sameSite: 'Strict'
        });

        res.redirect('/doctor/doctorHome');

    } catch (error) {
        console.log(error);
        next(error);
    }
};


// DOCTOR HOME
export const getDoctorHome = async (req, res, next) => {
  try {
    const doctorId = req.doctor?.id;

    if (!doctorId) {
      throw new Error("Doctor not authenticated");
    }

    const doctor = await myDentist.findById(doctorId);

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    const now = new Date();

    // START & END OF TODAY
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // NEXT APPOINTMENT TODAY ONLY
    const nextAppointment = await myAppointment
      .findOne({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      })
      .sort({ appointmentTime: 1 });

    // ONLY TIME STRING
    const nextTimeOnly = nextAppointment
      ? nextAppointment.appointmentTime
      : null;

    res.render("pages/doctorHome", {
      title: "Welcome Doctor Home",
      doctor,
      nextTimeOnly
    });

  } catch (error) {
    next(error);
  }
};

//  PATIENT DETAIL LIST

export const getDrPtChatList = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    const appointments = await myAppointment
      .find({ doctor: doctorId })
      .populate("patient");

    // remove duplicates
    const uniquePatients = new Map();

    appointments.forEach(app => {
      if (app.patient) {
        uniquePatients.set(app.patient._id.toString(), app.patient);
      }
    });

    const patients = Array.from(uniquePatients.values());

    res.render("pages/doctorPatientChatList", {
      title: "Patient List",
      patients
    });

  } catch (error) {
    next(error);
  }
};


// TO VIEW SINGLE PATIENT DETAILS WITH TRETMENT DETAILS
export const getSinglePatientView = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    console.log('Patient', req.params.id)
    // PATIENT INFO
    const patient = await myPatient.findById(patientId);

    // APPOINTMENTS
    const appointments = await myAppointment
      .find({ patient: patientId })
      .sort({ appointmentDate: -1 });

    const treatments = await myTreatmentRecord
      .find({ patient: patientId })
      .sort({ createdAt: -1 });

    res.render("pages/singlePatientDetailsDoctor", {
      title: "Patient Details",
      patient,
      appointments,
      treatments
    });

  } catch (error) {
    next(error);
  }
};

// ADD TREATMENT RECORD
export const postAddTreatment = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;
    const { patientId, toothNumber, diagnosis, procedure, notes,prescription,medicine,dosage,frequency,duration } = req.body;

    await myTreatmentRecord.create({
      patient: patientId,
      doctor: doctorId,
      toothNumber,
      diagnosis,
      procedure,
      notes,
      prescription:{
        medicine,
        dosage,
        frequency,
        duration
      }
    });

    res.redirect(`/doctor/patient/${patientId}`);

  } catch (error) {
    next(error);
  }
};



// TO SEND ADMIN REGARDING TREATMENT STATUS

export const createTreatmentNotification = async (req, res, next) => {
  try {
    const { patientId, treatment } = req.body;
    const doctorId = req.doctor._id;

    // Find patient
    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    // Create meaningful message
    const message = `Dr completed ${treatment} for patient ${patient.name}`;

    // Save notification
    await drNotification.create({
      type: "Treatment Completion Request",
      patient: patientId,
      doctor: doctorId,
      message,
      
    });

    //  Redirect back (doctor UI)
    return res.redirect("/doctor/patient");

  } catch (error) {
    next(error);
  }
};

// PAYMENT  

export const getDoctorPayment = async (req, res, next) => {
    try {
        const doctorId = req.doctor?.id;

        if (!doctorId) {
            throw new Error("Doctor ID missing");
        }

        const doctor = await myDentist.findById(doctorId);

        if (!doctor) {
            throw new NotFoundError("Doctor not found");
        }

        const payments = await myPayment
            .find({ doctor: doctorId })
            .sort({ createdAt: -1 });

        res.render("pages/doctorPayment", {
            title: "Payment Details",
            payments,
            doctor
        });

    } catch (error) {
        console.error("Doctor Payment Error:", error);
        next(error);
    }
};

//To get todays and weekly Appointments 
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.doctor.id;

    const now = new Date();

    // TODAY'S APPOINTMENT
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = await myAppointment
      .find({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate("patient")
      .sort({ appointmentTime: 1 });

    // WEEK RANGE 
    const day = now.getDay(); // 0 = Sunday

    const monday = new Date(now);
    const diffToMonday = day === 0 ? -6 : 1 - day;
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weeklyAppointments = await myAppointment
      .find({
        doctor: doctorId,
        appointmentDate: { $gte: monday, $lte: sunday }
      })
      .populate("patient")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.render("pages/doctorAppointments", {
      title: "My Appointments",
      todaysAppointments,
      weeklyAppointments
    });

  } catch (error) {
    next(error);
  }
};


export const dentistLogOut = (req,res)=>{
    res.clearCookie('dentistToken',{httpOnly:true,sameSite: 'Strict'})
    res.redirect('/')
}