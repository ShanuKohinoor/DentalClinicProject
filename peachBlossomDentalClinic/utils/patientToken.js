import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()


const patientSecret = process.env.JWT_SECRET


export const createPatientToken = (patient)=>{
    const payload ={
        id: patient._id,
        name: patient.name,
        role: 'patient'
    }
    return jwt.sign(payload,patientSecret,{expiresIn:'60m'})
}