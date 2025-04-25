import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../Models/user.schema.js";

dotenv.config()


const authMiddleware = (userRole)=> async(req,res,next)=>{

    const token =  req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            message:"Token is Missing",
            error_code:401,
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded;

        const user = await User.findById(req.user._id)
        if(user.userRole != userRole){
            return res.status(401).json({
                messege:"Un Authorized User",
                error_code:401
            })
        }

        next()
        
    } catch (error) {
       console.log(error) 
       res.status(500).json({ message: "Internal Server Error" });
    }
}

export default authMiddleware