import mongoose from "mongoose";

const adminSchema = new mongoose.Schema ({

    email: {
        type: String,
        required: true,
        unique: true
    },

    password:{
       type: String,
       required: true
    }
})


const myAdmin = mongoose.model('Admin',adminSchema) // mongoose.model('Admin', adminSchema) creates a collection called admins 
                                                    //        (Mongoose converts 'Admin' to lowercase plural automatically).



export default myAdmin      // can write:- export const myAdmin = mongoose.model('Admin',adminSchema) instead of this line