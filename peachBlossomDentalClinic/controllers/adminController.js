import myAdmin from "../models/admin.js"
import bcrypt from "bcrypt"                        // To hash password
import crypto from "crypto"                        // For sending activation link to patient for confirmation and set password
import {sendEmail} from '../utils/sendEmail.js'

import {myPatient} from  '../models/patients.js'
import {myDentist} from "../models/doctors.js"

import {BadRequestError, DuplicateError, NotFoundError, unAuthorizedError} from '../utils/error.js'
import { createAdminToken } from "../utils/adminToken.js"
import { myPayment } from "../models/doctorPayment.js"
import { myPatientInvoicePayment } from "../models/patientInvoicePayment.js"
import { myAppointment } from "../models/appointment.js"
import { myInvoice } from "../models/invoice.js"

export const getAdminLogin = (req,res)=>{
    res.render('pages/adminLogin')
}


export const postAdminLogin = async(req,res,next)=>{
    try {
        const {email,password} = req.body

        if(!email || ! password){
            throw new BadRequestError('Email and Password are required')
        }

        // Find admin by email
        const admin = await myAdmin.findOne({email})

        if(!admin){
            throw new unAuthorizedError('Invalid email')
        }

        const isMatch = await bcrypt.compare(password,admin.password)

        if(!isMatch){
            throw new unAuthorizedError('Invalid password')
        }

        const token = createAdminToken(admin)
        res.cookie('adminToken',token,{httpOnly:true,sameSite:'Strict'})
        res.redirect('/admin/home')

        } catch(error){
           next(error)
        }
}


export const createAdmin = async(req,res,next)=>{
    try{
         const existing = await myAdmin.findOne({email:'admin@gmail.com'})
         if (existing){
           return res.send('Admin already exist')
         } 

        const hashedPassword = await bcrypt.hash('123456',10)   // hash the password

        const admin = new myAdmin({
          email:'admin@gmail.com',
          password: hashedPassword                // save hashed password
        })
        await admin.save()
        res.send('Admin created Successfully')
    }catch(error){
        next(error)
    }
}

// To get admin home page
export const getAdminHome = async(req,res,next)=>{
      try{
        // To get total patients count
         const totalPatients = await myPatient.countDocuments()
        // To get total doctors count today available

        const todayAvailable = new Date().toLocaleDateString('en-US',{
          weekday:'long'
        })
         const totalDoctorsAvailableToday = await myDentist.countDocuments({
            availableDays: todayAvailable
         })


// To get todays revenue and todays appointment count
// --------------------------------------------------
         const now = new Date()

         const startOfDay = new Date(now)
         startOfDay.setHours(0,0,0,0)

         const endOfDay = new Date(now)
         endOfDay.setHours(23,59,59,999)

    // To get today's revenue
         const todaysPayments = await myPatientInvoicePayment.find({
           createdAt:{
            $gte:startOfDay,
            $lte:endOfDay
           }
         })

         const totalRevenue = todaysPayments.reduce((sum,payment)=>sum+(payment.amountPaid ||0),0)


   // To display today's appoinments
         const todaysAppointment = await myAppointment.aggregate([
          { 
            $match:{
              appointmentDate: {$gte: startOfDay, $lte: endOfDay}     // only todays appointment
            }
          },
          {
            $lookup :{                    // Join with patient collection
              from: 'patients',                 // collection name in MongoDB
              localField : 'patient',           // patient field in Appointment collection
              foreignField : '_id',             // ._id in patients(matching id from patient collection):-  MongoDB will find a patient in patients collection whose _id equals the patient field in the appointment.
              as: 'patientData'                 // output array(new array is created)
            }
          },
          {
            $unwind:{ path:'$patientData', preserveNullAndEmptyArrays: true} // $unwind use to convert array to object
          },                                                                 // preserveNullAndEmptyArrays :- when apointment doesnt have matching field,$unwind delete whole document,to avoid this use preserveNullAndEmptyArrays       
          {
            $lookup:{
              from: 'doctors',
              localField: 'doctor',
              foreignField: '_id',
              as: 'doctorData'
            }
          },
          {
            $unwind: { path: '$doctorData', preserveNullAndEmptyArrays: true}
          },
        {
          $sort: {appointmentTime:1}

        }
      ])



          // To get weekly appointment

        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of today

        const day = today.getDay();

        // Calculate Monday of current week
        const monday = new Date(today);
        const diffToMonday = day === 0 ? -6 : 1 - day; 
        monday.setDate(today.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        // Calculate Saturday of current week
        const saturday = new Date(monday);
        saturday.setDate(monday.getDate() + 5);
        saturday.setHours(23, 59, 59, 999);


        // Fetch weekly appointments
        const weeklyAppointments = await myAppointment.aggregate([
          {
            $match: {
              appointmentDate: {
                $gte: monday,
                $lte: saturday
              }
            }
          },
          {
            $lookup: {
              from: 'patients',
              localField: 'patient',
              foreignField: '_id',
              as: 'patientDatas'
            }
          },
          { 
            $unwind: { 
              path: '$patientDatas', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          {
            $lookup: {
              from: 'doctors',
              localField: 'doctor',
              foreignField: '_id',
              as: 'doctorData'
            }
          },
          { 
            $unwind: { 
              path: '$doctorData', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          {
            $sort: { appointmentDate: 1, appointmentTime: 1 }
          }
        ]);
        res.render('pages/adminHome', {
          title: 'Admin DashBoard',
          totalPatients,
          totalDoctorsAvailableToday,
          totalRevenue,
          todaysAppointment,
          weeklyAppointments
        });

        } catch (error) {
          next(error);
        }
        };

        
//                                     ADMIN-PATIENT
//                                     -------------

// To get page to add new patient by admin 

    export const getNewPatientForm = async (req,res,next)=>{
    try{
        res.render('pages/addPatient',{title: 'Add new Patient'});
    }catch(error){
        next(error)
    }
    }

// Post patientform and save patient to DB
export const postNewPatientForm = async (req,res,next)=>{
  try{
    const { name, age, gender, phone, email } = req.body;
    
    if(!name || !phone || !email){
      throw new BadRequestError('Name, Phone Number and email are required')
    }

    const existing = await myPatient.findOne({ email });

    if (existing) {
      return res.status(400).render("pages/addPatient", {
        title: "Add New Patient",
        error: "Patient already exists",
        patient: req.body
      });
    }

    const patients = await myPatient.find({
      registrationNumber: { $exists: true, $ne: "" }
    });

    let maxNumber = 0;

    patients.forEach(patient => {
      const match = patient.registrationNumber.match(/^REG-(\d+)$/);

      if (match) {
        const num = parseInt(match[1]);

        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const registrationNumber =
      `REG-${String(maxNumber + 1).padStart(4, "0")}`;

    //   generate activation token for request for activate account by patient through email
    const activationToken = crypto.randomBytes(32).toString('hex')

    //  2. expiry (24 hours)
    const activationExpires = Date.now() + 24 * 60 * 60 * 1000;

    const patient = new myPatient({
      registrationNumber,
      name,
      age,
      gender,
      phone,
      email,  

      isActivated: false,
      activationToken,
      activationExpires
    });

    await patient.save();

    try {

      const activationLink = `http://192.168.0.102:5000/patient/activate/${activationToken}`;

      await sendEmail(
        email,
        "Activate your account",
        `
          <h2>Welcome to Dental Clinic</h2>
          <p>Click below to activate:</p>
          <a href="${activationLink}">Activate Account</a>
        `
      );

    } catch (err) {
      console.log("Email failed but patient saved:", err.message);
    }

    res.redirect('/admin/patientDetails');

  } catch(error){
    next(error);
  }  
}

// List all patients
export const getPatientDetail =async (req,res,next)=>{    
    try{

      const search = req.query.search || '';

      let query = {}

      if(search){
        query={
          $or:[
            {name:{$regex:search,$options:'i'}},
            {email:{$regex:search,$options:'i'}},
            {phone:{$regex:search,$options:'i'}},
            {registrationNumber:{$regex:search,$options:'i'}}
          ]
        }
      }


    const patients = await myPatient.find(query).sort({ createdAt: -1 }) // latest first
    res.render('pages/patientDetail',{title: 'Patient Details',patients,search})

    } catch(error){
        next(error)
    }
}


// View single patient 
export const getAdminViewPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new BadRequestError('Patient not found');
    }

    // fetch appointments related to this patient
    const appointments = await myAppointment
      .find({ patient: patient._id })
      .populate('doctor')
      .sort({ appointmentDate: -1 });

      const payments = await myPatientInvoicePayment
       .find({ patient: patientId })
       .sort({ createdAt: -1 });

       const invoices = await myInvoice
      .find({ patient: patientId })
      .sort({ createdAt: -1 });

    res.render('pages/patientView', {
      title: 'Patient Profile',
      patient,
      appointments,
      payments,
      invoices   
    });
  } catch (error) {
    next(error);
  }
};



//  To get Edit Patient page
export const getEditPatientForm = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    const patient = await myPatient.findById(patientId);

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    res.render('pages/patientEdit', {
      title: 'Edit Patient',
      patient,
    });
  } catch (error) {
    next(error);
  }
};


//  To post Edit Patient page
export const postEditPatientForm = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const { name, age, gender, phone, email } = req.body;

    if (!name || !phone || !email) {
      throw new BadRequestError('Name, Phone Number, and Email are required');
    }

    const patient = await myPatient.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Update fields
    patient.name = name;
    patient.age = age;
    patient.gender = gender;
    patient.phone = phone;
    patient.email = email;

    await patient.save();

    res.redirect('/admin/patientDetails'); // redirect to patient list
  } catch (error) {
    next(error);
  }
};




//    Delete patient

export const deletePatient = async(req,res,next)=>{
  try{
    const patient = await myPatient.findById(req.params.id)

    if(!patient){
      throw new NotFoundError('Patient not found')
    }

    await myPatient.findByIdAndDelete(req.params.id)
    res.redirect('/admin/patientDetails')
  }catch(error){
    next(error)
  }
}


//                                     ADMIN-DOCTOR
//                                     -----------

//To get add new doctor form page

 export const getNewDoctorForm = (req,res)=>{
    res.render('addDoctor',{title:'Add new Doctor'})
 }


// To store Dentist details in Database
export const postNewDoctorForm =async (req,res,next)=>{
    try{
        const { name,phoneNumber,email,specialization,experience,salary,availableDays} = req.body
        if (!name || !email || !phoneNumber){
            throw new BadRequestError('Name,Phone Number and email required')
        }

         // pre-check for duplicates
         const existing = await myDentist.findOne({
          $or:[{name},{email},{phoneNumber}]
         })

         if (existing){
          return next(new DuplicateError('Doctor with this name,email,or phone number already exists'))
         }

        const dentist = new myDentist ({
            name,
            phoneNumber,
            email,
            specialization,
            experience,
            salary,
            availableDays
          
        })

        await dentist.save()
        res.redirect('/admin/doctorDetails')
    }catch(error){
      console.error(error)
        next(error)
    }
}


// To  get dentist detail page
 
export const getDoctorDetail = async (req, res, next) => {
  try {
    const clinicDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const search = req.query.search || '';

      let query = {}

      if(search){
        query={
          $or:[
            {name:{$regex:search,$options:'i'}},
            {email:{$regex:search,$options:'i'}},
            {phoneNumber:{$regex:search,$options:'i'}},
            {specialization:{$regex:search,$options:'i'}}
          ]
        }
      }


    // Aggregate dentists with their last payment
    const dentists = await myDentist.aggregate([
      {$match:query},
      {
        $lookup: {
          from: 'payments',          // collection name for payments
          let: { doctorId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$doctor', '$$doctorId'] } } },
            { $sort: { createdAt: -1 } },  // last payment first
            { $limit: 1 }                  // only take the last payment
          ],
          as: 'lastPayment'
        }
      },
      {
        $addFields: {
          paymentStatus: {
            $cond: [
              { $gt: [{ $size: '$lastPayment' }, 0] },
              { $arrayElemAt: ['$lastPayment.status', 0] },
              'No Payments'
            ]
          },
          isAllDays: {
            $cond: [
              { $isArray: '$availableDays' },
              {
                $reduce: {
                  input: clinicDays,
                  initialValue: true,
                  in: {
                    $and: [
                      '$$value',
                      { $in: ['$$this', '$availableDays'] }
                    ]
                  }
                }
              },
              false
            ]
          }
        }
      },
      { $project: { lastPayment: 0 } } 
    ]);

    res.render('pages/doctorDetail', {
      title: 'Doctor Directory',
      dentists,
      search
    });
  } catch (error) {
    next(error);
  }
};

// To get view page of doctor by Admin
export const getAdminViewDoctor = async(req,res,next)=>{
    try{
         const dentistId = req.params.id

         const dentist = await myDentist.findById(dentistId)
          
         if(!dentist){
            throw new BadRequestError('Doctor Not Found')
         }

         res.render('pages/doctorView',{title:'Details',dentist})

    }catch(error){
        next(error)
    }
}

// To get edit form of doctor by Admin

export const getAdminEditDoctor= async(req,res,next)=>{
  try{
     const doctor = await myDentist.findById(req.params.id)
     if(!doctor){
      throw new NotFoundError('Doctor not found')
     }
     res.render('pages/editDoctor',{title:'Edit Doctor',doctor})
  }catch(error){
    next(error)
  }
}


// To post edit form of doctor by Admin

export const postAdminEditDoctor= async(req,res,next)=>{
  try{
    const {name,email,phoneNumber,specialization,salary,availableDays,experience } = req.body
      
        console.log("Updating salary to:", salary);

    
    if (!name || !email || !phoneNumber){
            throw new BadRequestError('Name,Phone Number and email required')
        }
    const doctor = await myDentist.findById(req.params.id)

    if(!doctor){
      throw new NotFoundError('Doctor not Found')
    }

    //update fields
      doctor.name = name;
      doctor.email =email;
      doctor.phoneNumber=phoneNumber;
      doctor.specialization =specialization;
      doctor.salary=salary;
      doctor.availableDays=availableDays;
      doctor.experience= experience;
    
    await doctor.save()
    res.redirect(`/admin/doctor/${doctor._id}/view`);
  }catch(error){
    next(error)
  }
}


// To delete doctor by Admin
export const deleteDoctor = async(req,res,next)=>{
  try{
  const doctor = await myDentist.findById(req.params.id)

  if(!doctor) {
    throw new NotFoundError('Doctor not found')
  }

  await myDentist.findByIdAndDelete(req.params.id)
  res.redirect('/admin/doctorDetails')
  }catch(error){
    next(error)
  }
}




// To get Doctor payment History Details Page 

export const getDoctorPaymentHistory = async(req,res,next)=>{
    try{
      const doctor = await myDentist.findById(req.params.id)
      if(!doctor) throw new BadRequestError('Doctor Not Found')
        
        const payments = await myPayment.find({doctor: doctor._id}).sort({updatedAt:-1})
        res.render('doctorPaymentHistory',{title:'Payment Details ',doctorName:doctor.name,doctor,payments,salary:doctor.salary})
    }catch(error){
        next(error)
    }
}



export const adminLogOut = (req,res)=>{
    res.clearCookie('adminToken',{httpOnly:true,sameSite:'Strict'})
    res.redirect('/')
}


// NOTIFICATION FROM DOCTOR AFTER TREATMENT
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await drNotification
      .find()
      .populate("patient")
      .populate("doctor")
      .sort({ createdAt: -1 });

    res.render("pages/adminsNotification", {
      title: "Notifications",
      notifications
    });
  } catch (error) {
    next(error);
  }
};