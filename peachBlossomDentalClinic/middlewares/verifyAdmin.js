import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()
import { unAuthorizedError } from "../utils/error.js";

const adminSecret = process.env.JWT_SECRET
export const verifyAdmin=(req,res,next)=>{
    const token = req.cookies?.adminToken;

    if(!token){
        return next(new unAuthorizedError('Please Login First'))
    }

    try{
      const decoded = jwt.verify(token,adminSecret)

      req.admin = {
        id : decoded.id,
        name : decoded.name,
        role: decoded.role
      }
      next()
    }catch(error){
         console.log('JWT ERROR TYPE:',error.name);
         console.log('JWT ERROR MSG:',error.message);
         
         
        res.clearCookie('adminToken')
        return next(new unAuthorizedError('Session Expired. Please Login again'))
    }
}