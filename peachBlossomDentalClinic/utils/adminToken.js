import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

const adminSecret = process.env.JWT_SECRET

export const createAdminToken = (admin)=>{
   const payload = {
    id : admin._id,
    name: admin.name,
    role: 'admin'
   }
   return jwt.sign(payload,adminSecret,{expiresIn:'3hr'})
}