import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { unAuthorizedError } from '../utils/error.js';


const doctorSecret = process.env.JWT_SECRET

export const verifyDoctor = (req,res,next)=>{
    const token = req.cookies.dentistToken

    if(!token){
        return next(new unAuthorizedError('Please Login First'))
    }

   try{
  
    //verify token
    const decoded = jwt.verify(token,doctorSecret)

    //Attach doctor info with request
    req.doctor = {
        id : decoded.id,
        name : decoded.name,
        role: decoded.role
    }
    next()
   }catch(error){
       res.clearCookie('dentistToken')
        return next( new unAuthorizedError('Session Expired. Please Login again'))
   }
    }