import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        match: [/^[A-Za-z\s]+$/, 'Name should contain only alphabets']
    },

    age: {
        type: Number,
        min: [0, 'Age cannot be negative'],
        max: [120, 'Age cannot be more than 120']
    },

    gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer not to say'],
        required: true
    },

    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },

    password: {
        type: String,
        required: false
    },

    isActivated: { // while admin create patient,account not activated yet.so patient must activate account via email link
        type: Boolean,
        default: false
    },

    activationToken: String,

    activationExpires: Date,

    registrationNumber: {
        type: String,
        unique: true,
        required: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
},
{ timestamps: true })

export const myPatient = mongoose.model('Patient', patientSchema)