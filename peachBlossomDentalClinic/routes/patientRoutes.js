import express from 'express'

import
 { 
    getAppointment,
    postAppointment,
    getSignIn,
    postSignIn,
    activatePatient,
    setPassword,
    getForgotPasswordPage,
    postForgotPasswordPage,
    getResetPasswordPage,
    resetPassword,
    getPatientHome, 
    patientLogOut
} from '../controllers/patientController.js'

    import {
     getPatientAppointmentForm,
     postPatientAppointment,
     getPatientAppointments,
    }
       from '../controllers/appointmentController.js'

import { preventPatientSignIn } from '../middlewares/preventPatientSignIn.js'
import { preventPatientAppointmentLogin } from '../middlewares/preventPatientAppointmentLogin.js'
import { verifyPatient } from '../middlewares/verifyPatient.js'

const router = express.Router()

router.get('/loginPage',preventPatientAppointmentLogin,getAppointment)
router.post('/loginPage',preventPatientAppointmentLogin,postAppointment)

router.get('/signIn',preventPatientSignIn,getSignIn)
router.post('/signIn',preventPatientSignIn,postSignIn)


router.get('/activate/:token',activatePatient)
router.post('/activate/:token',setPassword)

// Reset password if forget the password
router.get('/forgot-password', getForgotPasswordPage);
router.post('/forgot-password',postForgotPasswordPage)
router.get('/reset-password/:token', getResetPasswordPage);
router.post('/reset-password/:token', resetPassword);

router.use(verifyPatient);  // can use for all routes. instead of writing verifyAdmin in every route,we can write like this

router.get('/bookAppointment', getPatientAppointmentForm);
router.post('/bookAppointment', postPatientAppointment);
router.get('/myAppointments', getPatientAppointments);



router.get('/patientHome',getPatientHome)


router.get('/logout',patientLogOut)

export default router