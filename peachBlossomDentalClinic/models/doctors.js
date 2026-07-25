import mongoose from 'mongoose'



const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    availableDays: {
        type: [String],
        default: []
    },
    qualification: String,
    specialization: String,
    experience: String,
    salary: {
        type: Number,
        required: true,
        min:0
    }
},{timestamps:true})


export const myDentist = mongoose.model('Doctor',doctorSchema)