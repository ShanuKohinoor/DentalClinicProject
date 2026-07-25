import mongoose from "mongoose";


const doctorNotification = new mongoose.Schema(
    {
        type:{                              //type of notification
          type: String,
          enum:['Treatment Completion Request','Appointment Update','Payment Alert'],
          required:true
        },

        patient:{                           // about who the notification is
            type:mongoose.Schema.Types.ObjectId,
            ref: 'myPatient',
            required: true
        },
        doctor:{                           //Dr send the notification
            type: mongoose.Schema.Types.ObjectId,
            ref: 'myDentist',
            required:true
        },
        status:{
            type: String,
            enum:['pending','approved','rejected'],
            default:'pending'
        },
        message:{
            type: String,
            required:true
        },
        isRead:{
            type: Boolean,
            default: false
        },


    },
    {timestamps: true}

)


export const drNotification = mongoose.model('Notifications',doctorNotification)