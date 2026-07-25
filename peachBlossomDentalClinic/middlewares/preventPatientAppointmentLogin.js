export const preventPatientAppointmentLogin = (req,res,next)=>{
    const token = req.cookies?.patientToken;
    if(token){ 
        return res.redirect('/patient/bookAppointment')

    }
        next()
}