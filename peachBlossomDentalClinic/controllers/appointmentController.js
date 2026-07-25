import { myAppointment } from "../models/appointment.js";
import { myPatient } from "../models/patients.js";
import { myDentist } from "../models/doctors.js";
import { BadRequestError } from "../utils/error.js";
import { myInvoice } from "../models/invoice.js";
import { sendEmail } from "../utils/sendEmail.js";


// Show form to add new appointment (admin)
export const getNewAppointmentForm = async (req, res, next) => {

  try {
    const doctors = await myDentist.find();
    
    res.render('pages/adminAddAppointment', {
      title: 'Add Appointment (Admin)',
      clinicName: 'Peach Blossom Dental Care',
      country: 'Birmingham',
      selectedDate: new Date().toDateString(),
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// Save new appointment (admin)
export const postNewAppointment = async (req, res, next) => {
  try {
    const {name, email, doctor, appointmentDate, appointmentTime, treatment } = req.body;

    
    if (!name ||!email || !doctor || !appointmentDate || !appointmentTime || !treatment ) {
      throw new BadRequestError('All fields are required');
    }

    // Check if patient exists
const patient = await myPatient.findOne({ email,name });

if (!patient) {
  throw new BadRequestError(
    "Patient not registered. Please register first."
  );
}

const patientType = "existing";

    // prevent same doctor with same slot appointment(even for another patient)
    const slotConflict = await myAppointment.findOne({
      doctor,
      appointmentDate:new Date(appointmentDate),
      appointmentTime
    })

    if(slotConflict){
      throw new BadRequestError('This doctor is already booked at this time')
    }


    // prevent same patient with same doctor

    const patientDoctorConflict = await myAppointment.findOne({
      patient:patient._id,
      doctor,
      status:{$in:['Scheduled','Confirmed']}
    })

    if(patientDoctorConflict){
      throw new BadRequestError('This patient already has an appointment with this doctor')
    }

    // Create appointment for existing patient
    await myAppointment.create({
      patient: patient._id,
      name: patient.name,
      email: patient.email,
      doctor,
      appointmentDate,
      appointmentTime,
      status: 'Scheduled',
      treatment,
      patientType
    });


    // Redirect admin to appointment list
    res.redirect('/admin/allPatientAppointments');
  } catch (error) {
    console.error(error)
    next(error);
  }
};


// List all appointments (admin)
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await myAppointment.find().populate('doctor').populate('patient').sort({ appointmentDate: 1 });
    res.render('pages/adminPatientAppointment', {
      title: 'Patient Appointments',
      appointment: appointments
    });
  } catch (error) {
    next(error);
  }
};



// Confirm appointment (admin)
export const confirmAppointment = async (req, res, next) => {
  try {
    const appointment = await myAppointment
      .findById(req.params.id)
      .populate('patient')
      .populate('doctor');
  
  if (!appointment) throw new BadRequestError('Appointment not found');

    appointment.status = 'Confirmed';
    await appointment.save();

    await sendEmail(
      appointment.email || appointment.patient.email,
      "Appointment Confirmed - Peach Blossom Dental Care",
      `
        <h2>Hi ${appointment.name},</h2>

        <p>Your appointment has been <b>CONFIRMED</b>.</p>

        <h3>Details:</h3>
        <ul>
          <li><b>Doctor:</b> Dr. ${appointment.doctor?.name || "Not Assigned"}</li>
          <li><b>Date:</b> ${appointment.appointmentDate.toDateString()}</li>
          <li><b>Time:</b> ${appointment.appointmentTime}</li>
        </ul>

        <p>Thank you for choosing our clinic.</p>
      `
    );

    res.redirect('/admin/allPatientAppointments');
  } catch (error) {
    next(error);
  }
};


//  Edit appointment( Admin)

  export const getEditAppointment = async(req,res,next)=>{
    try{
       const doctors = await myDentist.find()
       const appointment = await myAppointment.findById(req.params.id).populate('doctor')
       if(!appointment) {
        throw new BadRequestError('Appointment does not exist')
       }
       res.render('pages/editAppointments',{title:'Edit Appointment',doctors,appointment})

    }catch(error){
      next(error)
    }
  }

//  Post Edit appointment(Admin)
export const postEditAppointment = async (req, res, next) => {
  try {
    const {
      doctor,
      appointmentDate,
      appointmentTime,
      patientType,
      treatment
    } = req.body;


    const appointment = await myAppointment.findById(req.params.id);

    if (!appointment) {
      throw new BadRequestError("Appointment does not exist");
    }

    // VALIDATION (PREVENT SERVER CRASH)
    if (!doctor || !appointmentDate || !appointmentTime || !treatment) {
      throw new BadRequestError("Missing required fields in edit form");
    }

    const dateObj = new Date(appointmentDate);

    if (isNaN(dateObj.getTime())) {
      throw new BadRequestError("Invalid appointment date");
    }

    // SLOT CONFLICT CHECK
    const slotConflict = await myAppointment.findOne({
      _id: { $ne: req.params.id },
      doctor,
      appointmentDate: dateObj,
      appointmentTime
    });

    if (slotConflict) {
      throw new BadRequestError("This slot is already booked for this doctor");
    }

    // UPDATE
    appointment.doctor = doctor;
    appointment.appointmentDate = dateObj;
    appointment.appointmentTime = appointmentTime;
    appointment.patientType = patientType || appointment.patientType;
    appointment.treatment = treatment;

    await appointment.save();

    return res.redirect("/admin/allPatientAppointments");

  } catch (error) {
    console.error("EDIT ERROR:", error);
    next(error);
  }
};


// Cancel Appointment
export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await myAppointment.findById(req.params.id);
    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    
    appointment.status = 'Cancelled';
    await appointment.save();

    // send email notification
      await sendEmail(
        appointment.email,
        "Appointment Cancelled",
        `
          <h2>Appointment Cancelled </h2>
          <p>Hi ${appointment.name}, your appointment on ${appointment.appointmentDate.toDateString()} has been cancelled by the clinic. Please contact Peach Blossom Dental clinic. </p>
        `
      );

    res.redirect('/admin/allPatientAppointments'); // Redirect to list
  } catch (error) {
    next(error);
  }
};

//To complete appointment

const TREATMENT_PRICES = {
  pain: 50,
  scaling: 70,
  cleaning: 80,
  missingTeeth: 120,
  filling: 100,
  misalignedTeeth: 150,
  restoration: 200,
  rootCanal: 300,
  Orthodontics: 400,
  extraction: 150,
  routineCheckUp: 40,
};

export const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await myAppointment.findById(req.params.id);

    if (!appointment) {
      throw new BadRequestError("Appointment not available");
    }

    // mark completed
    appointment.status = "Completed";
    await appointment.save();

    // check if invoice already exists
    let invoice = await myInvoice.findOne({
      appointment: appointment._id,
    });

    if (!invoice) {
      const treatmentKey = appointment.treatment;

      // get cost from table
      const cost =
        TREATMENT_PRICES[treatmentKey] !== undefined
          ? TREATMENT_PRICES[treatmentKey]
          : 100;                                             // fallback

      const totalAmount = cost;

      invoice = await myInvoice.create({
        patient: appointment.patient,
        appointment: appointment._id,

        treatments: [
          {
            name: treatmentKey,
            cost: cost,
          },
        ],

        totalAmount: totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: "Pending",
      });

    }

    return res.redirect("/admin/allPatientAppointments");
  } catch (error) {
    console.error("COMPLETE ERROR:", error);
    next(error);
  }
};


//  Delete Appointment
  export const deleteAppointment= async(req,res,next)=>{
    try{
      const appointment = await myAppointment.findById(req.params.id)
      if(!appointment) {
        throw new BadRequestError('Sorry! Currently there is no Appointment for this patient')
      }

      // Delete the appoinment from DB
        await myAppointment.findByIdAndDelete(req.params.id);
         res.redirect('/admin/allPatientAppointments')
    }catch(error){
        next(error)
    }
  }

// Single patient appoinment view by admin
export const getAppointmentView = async (req, res, next) => {
  try {
    const appointment = await myAppointment
      .findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      throw new BadRequestError("Appointment not found");
    }

    res.render('pages/singleAppointmentView', {
      title: "Appointment Details",
      appointment
    });

  } catch (error) {
    next(error);
  }
};




//                              PATIENT  APPOINTMENT
//                              --------------------

// Show form for patient to book appointment
export const getPatientAppointmentForm = async (req, res, next) => {

  
  try {
    const doctors = await myDentist.find();

    // Pass clinic info to EJS
    res.render('pages/appointmentDetail', {
      title: 'Book your appointment',
      clinicName: 'Peach Blossom Dental Care',
      country: 'Birmingham',
      selectedDate: new Date().toDateString(),
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// Save patient appointment (patient )
export const postPatientAppointment = async (req, res, next) => {
  try {
    const { name, email, phone, appointmentDate, appointmentTime, treatment } = req.body;

    if (!name || !email || !phone || !appointmentDate || !appointmentTime || !treatment) {
      throw new BadRequestError('All fields are required');
    }

      const patient = await myPatient.findOne({ email });

      if (!patient) {
        throw new BadRequestError(
          "Patient not registered. Please register first."
        );
      }

      const patientType = "existing";


    // Check duplicate appointment
    const existing = await myAppointment.findOne({
      email,
      appointmentDate,
      appointmentTime,
      treatment
    });

    if (existing) {
      throw new BadRequestError('You already have an appointment at this time.');
    }

    await myAppointment.create({
      patient: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      appointmentDate,
      appointmentTime,
      status: 'Scheduled',
      treatment,
      patientType
    });

    res.redirect('/');

  } catch (error) {
    next(error);
  }
};



// List patient appointments
export const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await myAppointment.find({ email: req.patient.email }).populate('doctor').sort({ appointmentDate: -1 });
    res.render('pages/appointmentList', {
      title: 'My Appointments',
      appointment: appointments
    });
  } catch (error) {
    next(error);
  }
};




// GET available doctors by date
export const getAvailableDoctorsByDate = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const selectedDate = new Date(date);

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const doctors = await myDentist.find({
      availableDays: dayName,
    });

    res.json({ doctors });
  } catch (error) {
    next(error);
  }
};