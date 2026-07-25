import express from 'express'
const router = express.Router()

import { getDoctorLogin,postDoctorLogin,getDoctorHome,getDoctorAppointments,getDrPtChatList,
    getDoctorPayment,getSinglePatientView,postAddTreatment,dentistLogOut,createTreatmentNotification 
} from '../controllers/doctorController.js'

import { preventDoctorLogin } from '../middlewares/preventDoctorLogin.js'

import { verifyDoctor } from '../middlewares/verifyDoctor.js'

router.get('/login',preventDoctorLogin,getDoctorLogin)
router.post('/login',preventDoctorLogin,postDoctorLogin)

router.get('/doctorHome',verifyDoctor,getDoctorHome)
router.get("/appointments", verifyDoctor, getDoctorAppointments);

router.get('/chatList',verifyDoctor,getDrPtChatList)             // List of patients
router.get('/patient/:id',verifyDoctor, getSinglePatientView);
router.post("/patient/treatment/add", verifyDoctor, postAddTreatment);
router.post('/treatment/complete',verifyDoctor,createTreatmentNotification)

router.get('/payments',verifyDoctor,getDoctorPayment)

router.get('/logout',verifyDoctor,dentistLogOut)

export default router