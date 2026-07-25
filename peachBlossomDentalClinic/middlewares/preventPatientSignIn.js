

export const preventPatientSignIn = (req,res,next)=>{
    const token = req.cookies?.patientToken;
    if(token) {
        return res.redirect('/patient/patientHome')
    }
        next()
}