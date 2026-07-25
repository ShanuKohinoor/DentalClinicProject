import { myPatient } from "../models/patients.js"
import bcrypt from "bcrypt"

// import { myAppointment } from "../models/appointment.js"
import { BadRequestError, NotFoundError} from "../utils/error.js"
import { createPatientToken } from "../utils/patientToken.js"
// import { myDentist } from "../models/doctors.js"

import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";



// To book appointment directly
export const getAppointment = (req,res)=>{     
    
    res.render('pages/patientLogin',{title: 'Get an Appointment'})
}

// Post appointment
export const postAppointment =async(req,res,next)=>{
    try{
        const {email} = req.body

        const patient = await myPatient.findOne({email})
        if(!patient){
          throw new NotFoundError([
            'Patient not found',
            'Please create an account'
          ])

       }
      //  create a token
          const token = createPatientToken(patient)
          res.cookie('patientToken',token,{httpOnly:true,sameSite: 'Strict'})
            res.redirect('/patient/bookAppointment')


    }catch(error){
        next(error)
    }
}



export const getSignIn = (req,res)=>{
    res.render('pages/signInPatient',{title:'Patient Login Page'})
}

export const postSignIn = async(req,res,next)=>{
    try{
    const {email,password} = req.body
    const patient = await myPatient.findOne({email})

    if(!patient){
        throw new NotFoundError('Patient not found')
    }
    if(!patient.isActivated){
        throw new BadRequestError('Please activate your account first')
    }



    const isMatch = await bcrypt.compare(password,patient.password)
    if(!isMatch){
        throw new BadRequestError('Invalid password')
    }

    const token = createPatientToken(patient);
    res.cookie('patientToken',token,{httpOnly:true,sameSite:'Strict'})
    res.redirect('/patient/patientHome')
    }catch(error){
        next(error)
    }
}


// To activate link send by admin
 export const activatePatient = async(req,res,next)=>{
    try{
        const {token}=req.params;

        const patient = await myPatient.findOne({
            activationToken:token,
            activationExpires:{$gt: Date.now()}
        })
        if(!patient){
           throw new BadRequestError('Invalid or expired validation link')
        }
        res.render('pages/setPassword',{
            token,
            error:null       
         })
      }catch(error){
        next(error)
      }    
 }

// Set password
 export const setPassword = async (req,res,next)=>{
    try{
       const {password,confirmPassword} = req.body;
       const {token} = req.params;

       // To check empty password and length of password
        if (!password || password.length < 6) {
            return res.status(400).render('setPassword', {
                token,
                error: 'Password must be at least 6 characters',
                password,
                confirmPassword
            });
        }

      // To check confirm password

      if(password !== confirmPassword){
        return res.status(400).render('setPassword',{
            token,
            error:'Password and Confirm Password do not match',
            password,
            confirmPassword
        })
      }


       const patient = await myPatient.findOne({
        activationToken:token,
        activationExpires: {$gt:Date.now()},
        isActivated: false
       })
       if(!patient){
        return res.send('Patient not found')
       }

       const hashedPassword = await bcrypt.hash(password,10)

       patient.password = hashedPassword;
       patient.isActivated = true;

       //Remove token after use
       patient.activationToken = undefined;
       patient.activationExpires = undefined;

       await patient.save()
       res.render('pages/activationSuccess',{
        message: 'Account activated Successfully',
        loginUrl: '/patient/signIn'})

    }catch(error){
        next(error)
    }
 }

 // Get forgotpassword page When forget password while login

 export const getForgotPasswordPage = (req, res) => {
  res.render('pages/forgotPassword');
};

// When forget password while login
export const postForgotPasswordPage = async (req, res, next) => {
  try {
    const { email } = req.body;

    const patient = await myPatient.findOne({ email });

    if (!patient) {
      throw new BadRequestError("Patient not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    patient.resetPasswordToken = resetToken;
    patient.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min

    await patient.save();

    const resetLink = `http://localhost:5000/patient/reset-password/${resetToken}`;

    await sendEmail(
      patient.email,
      "Password Reset Request",
      `
        <h2>Reset Your Password</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `
    );

    res.send("Reset link sent to email");
  } catch (error) {
    next(error);
  }
};

//To get reset password page
export const getResetPasswordPage = async (req, res) => {
  res.render("pages/resetPassword", { token: req.params.token });
};

// Save changed password
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const token = req.params.token;

    const patient = await myPatient.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!patient) {
      throw new BadRequestError("Invalid or expired token");
    }

    patient.password = await bcrypt.hash(password, 10);

    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpires = undefined;

    await patient.save();

    res.redirect("/patient/signIn");
  } catch (error) {
    next(error);
  }
};

//To get patient Dashboard
export const getPatientHome = (req,res,next)=>{
    try{
    const patient = req.patient

    const hour = new Date().getHours()
    let greeting;

    if(hour < 12) {
        greeting = 'Good Morning'
    } else if (hour < 18) {
        greeting = 'Good Afternoon'
    } else {
        greeting = 'Good Evening'
    }
    res.render('pages/patientHome',{title:'Welcome to patient',patient,greeting})

    }catch(error){
        next(error)
    }
}

export const patientLogOut = (req,res)=>{
    res.clearCookie('patientToken',{httpOnly:true,sameSite: 'Strict'})
    res.redirect('/')
}