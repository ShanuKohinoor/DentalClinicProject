



export const preventAdminLogin = (req,res,next)=>{
   const token = req.cookies?.adminToken
   if(token) return res.redirect('/admin/home')
    next()
}