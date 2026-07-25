import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    doctor:{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Doctor',
     required: true
    },
    month:{
        type: String,
        required: true
    },
    totalSalary:{
        type: Number,
        required: true
    },
    paidAmount:{
        type: Number,
        default:0
    },
    paymentStatus:{
        type: String,
        enum: ['Pending','Paid'],
        default:'Pending',
        required:true
    },
    paymentDate:{
        type: Date
    }
 },
  {timestamps: true

})


export const myPayment = mongoose.model('Payment',paymentSchema)