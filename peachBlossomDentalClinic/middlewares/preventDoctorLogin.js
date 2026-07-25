
export const preventDoctorLogin = (req,res,next)=>{
    const token = req.cookies?.dentistToken
    if(token) return res.redirect('/doctor/doctorHome')
        next()
}