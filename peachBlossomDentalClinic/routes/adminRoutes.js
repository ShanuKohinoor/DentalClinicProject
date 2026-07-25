
import express from 'express'
import {
     getAdminLogin,
     postAdminLogin,
     getAdminHome,
     getNewPatientForm,
     postNewPatientForm,
     getPatientDetail,
     getNewDoctorForm,
     postNewDoctorForm,
     getDoctorPaymentHistory,
     getDoctorDetail,
     getAdminViewDoctor,
     getAdminEditDoctor,
     postAdminEditDoctor,
     deleteDoctor,
     getAdminViewPatient,
     deletePatient,
     getEditPatientForm,
     postEditPatientForm,
     adminLogOut,
     createAdmin,
     getNotifications
     } from "../controllers/adminController.js"

     import { preventAdminLogin } from '../middlewares/preventAdminLogin.js'
     import {
          getNewAppointmentForm,
          postNewAppointment,
          getAllAppointments,
          confirmAppointment,
          getEditAppointment,
          postEditAppointment,
          cancelAppointment,
          completeAppointment,
          deleteAppointment,
          getPatientAppointments,
          getAppointmentView,
          getAvailableDoctorsByDate
     } from '../controllers/appointmentController.js';


     import {
          getPaymentDetail,
          getInvoiceByAppointment,
          getSinglePatientPayments,
          getAddPatientPaymentForm,
          postAddPatientPayment,
          getPatientInvoices,
          postCreateInvoice,
          postPayInvoice,
          getInvoicePayments,
          getAllInvoices
     } from '../controllers/patientPaymentController.js';

     import {
          getAddPaymentForm,
          postAddPaymentForm
     } from '../controllers/doctorPaymentController.js';



import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router()

router.get('/createAdmin',createAdmin)
router.get('/login',preventAdminLogin,getAdminLogin)
router.post('/login',preventAdminLogin,postAdminLogin)

router.get('/home',verifyAdmin,getAdminHome)

router.get('/newPatient',verifyAdmin,getNewPatientForm)
router.post('/newPatient',verifyAdmin,postNewPatientForm)

router.get('/patientDetails',verifyAdmin,getPatientDetail)
router.get('/patient/:id/view',verifyAdmin,getAdminViewPatient)
router.post('/patient/:id/delete',verifyAdmin,deletePatient)
router.get('/patient/:id/edit',verifyAdmin,getEditPatientForm)
router.post('/patient/:id/edit',verifyAdmin,postEditPatientForm)


// Show form
router.get('/addAppointment',verifyAdmin,getNewAppointmentForm);

// Save form
router.post('/addAppointment',verifyAdmin,postNewAppointment);

// List appointments
router.get('/allPatientAppointments',verifyAdmin, getAllAppointments);


// Confirm appointment
router.post('/confirmAppointment/:id',verifyAdmin, confirmAppointment);

// Edit appointment
router.get('/editAppointment/:id',verifyAdmin,getEditAppointment)
router.post('/editAppointment/:id',verifyAdmin,postEditAppointment)

// Completed appointment
router.post('/completeAppointment/:id',verifyAdmin, completeAppointment);

// Cancel appointment
router.post('/cancelAppointment/:id',verifyAdmin,cancelAppointment)

// Delete appointment
router.post('/deleteAppointment/:id',verifyAdmin,deleteAppointment)

// Get single patient appoinment
router.get('/patient/:id/appointments', verifyAdmin, getPatientAppointments);

router.get('/appointment/:id/view', verifyAdmin, getAppointmentView);

router.get('/newDoctor',verifyAdmin,getNewDoctorForm)
router.post('/newDoctor',verifyAdmin,postNewDoctorForm)


router.get("/available-doctors",verifyAdmin,getAvailableDoctorsByDate);
router.get('/doctorDetails',verifyAdmin,getDoctorDetail)
router.get('/doctor/:id/view',verifyAdmin,getAdminViewDoctor)
router.get('/doctor/:id/edit',verifyAdmin,getAdminEditDoctor)
router.post('/doctor/:id/edit', verifyAdmin, postAdminEditDoctor)
router.post('/doctor/:id/delete',verifyAdmin,deleteDoctor)
router.get('/doctor/:id/manage',verifyAdmin,getAddPaymentForm)
router.post('/doctor/:id/manage',verifyAdmin,postAddPaymentForm)

router.get('/doctor/:id/paymentsHistory',verifyAdmin,getDoctorPaymentHistory)


router.get("/appointment/:id/invoice",verifyAdmin, getInvoiceByAppointment);
router.post("/invoice/pay/:id", verifyAdmin, postPayInvoice);
router.get("/invoicePayments",verifyAdmin,getInvoicePayments);
router.get("/allInvoices",verifyAdmin,getAllInvoices);

router.get('/paymentDetails',verifyAdmin,getPaymentDetail)
router.get('/patient/:id/payments',verifyAdmin,getSinglePatientPayments)
router.get('/patient/:id/payment', verifyAdmin, getAddPatientPaymentForm);
router.post('/patient/:id/payment', verifyAdmin, postAddPatientPayment);

router.get("/notifications",verifyAdmin, getNotifications);

router.post('/logout',verifyAdmin,adminLogOut)

export default router



