import jwt from 'jsonwebtoken'
import { NotFoundError,unAuthorizedError } from '../utils/error.js';
import { myPatient } from '../models/patients.js';

export const verifyPatient = async(req,res,next)=>{
    const token = req.cookies?.patientToken;

    if(!token){
        return next( new unAuthorizedError('Please Login First'))
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patient = await myPatient.findById(decoded.id)
        if (!patient) throw new NotFoundError('Patient not found');

        req.patient = patient;
        next();
    }catch(error){
        res.clearCookie('patientToken')
        return next( new unAuthorizedError('Session Expired. Please Login again'))
    }
}
