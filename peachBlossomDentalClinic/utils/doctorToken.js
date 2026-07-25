import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const doctorSecret = process.env.JWT_SECRET

export const createDoctorToken = (doctor)=>{
  const payload ={
    id : doctor._id,
    name : doctor.name,
    role : 'doctor'
  }
  return jwt.sign(payload,doctorSecret,{expiresIn: '60m'})
}