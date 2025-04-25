import mongoose from "mongoose";

const userSchema = mongoose.Schema( {
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userRole:{
        type:String,
        default:null
    },
    token: {
        type: String,
        default: null,
    },
    otp:{
        type:Number,
        default:null
    },
    OTPExpiry: {
        type: Date,
        default: null,
    },  
    activationStatus: {
        type: Boolean,
        default: false,
    },
    pwdVerifyString: {
        type: String,
        default: null,
    },
    resetTime: {
        type: Number,
        default: null,
    },
} );

const User = mongoose.model( "users", userSchema );
export default User;
