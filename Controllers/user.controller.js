import User from "../Models/user.schema.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const userRegister = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log(req.body)
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ data: { message: "user alredy exists" } });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const otp = generateOTP();
    const OTPExpiry = new Date().getTime() + 600000;

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      otp,
      OTPExpiry,
      userRole: "user",
    });
    await newUser.save();
    return res.status(200).json({
        message: "Account Activation link send to your mail",
        error_code: 200,
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
      
          message: "invalid email",
          error_code: 400,
        },
      );
    }

    if (user.activationStatus === true) {
      return res.status(400).json({
     
          message: "account already activated",
        },
      );
    }

    if(user.otp === null){
      return res.status(400).json({
        message:"OTP expired Please click Resend OTP"
      })
    }

    if (user.otp !== otp || user.OTPExpiry < Date.now()) {
        user.otp = null, 
        user.OTPExpiry = null,
        await user.save()

      return res.status(400).json({
         message: "Invalid OTP or OTP expired",
        },
      );
    }

    user.activationStatus = true,
    user.otp = null, 
    user.OTPExpiry = null;

    await user.save();
    return res.status(200).json({
  
        message: "user activation completed succesfully",
        error_code:200
        
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const resendOTP = async(req,res)=>{
try {
  const {email}=req.body
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
    
        message: "invalid email",
        error_code: 400,
      },
    );
  }

  if (user.activationStatus === true) {
    return res.status(400).json({
   
        message: "account already activated",
        error_code:400
      },
    );
  }
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  const OTP = generateOTP();
  const OTPExpiry = new Date().getTime() + 600000;

  user.otp=OTP;
  user.OTPExpiry=OTPExpiry
  await user.save()

  return res.status(200).json({
    message:"OTP sent to your register Email",
    error_code:200
  })

} catch (error) {
  console.log(error);
  res.status(500).json({ message: "Internal Server Error" });
  
}

}
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
      
          message: "invalid email",
          error_code: 400,
        },
      );
    }
    if (user.activationStatus === false) {
      return res.status(401).json({
      
          message: "account not activated",
          error_code: 401,
        },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({

          message: "invalid password",
          error_code: 401,
        },
      );
    }

    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });


    user.token = token;
    await user.save();
    return res.status(200).json({
        message: "user login succesfully",
        error_code: 200,
        token: token,
        role: user.userRole,
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({

          message: "invalid email",
          error_code:400
        },
      );
    }
    if (user.activationStatus === false) {
      return res.status(401).json({

          message: "account not activated",
          error_code: 401,
        },
      );
    }
    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000);
    }
    const pwdVerifyString = generateOTP();
    const resetTime = new Date().getTime()+ 600000;
    user.resetTime = resetTime;
    user.pwdVerifyString = pwdVerifyString;

    await user.save();
    return res.status(200).json({

        message: "OTP sent to your register E-mail",
        error_code: 200,
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { pwdVerifyString, password } = req.body;
    const user = await User.findOne({ pwdVerifyString });
    if (!user) {
      return res.status(400).json({
     
          message: "invalid OTP",
          error_code:400
        },
      );
    }
    if (user.activationStatus === false) {
      return res.status(401).json({
  
          message: "account not activated",
          error_code: 401,
        },
      );
    }

    const currentTime = new Date().getTime();
    if (user.resetTime < currentTime) {
        user.pwdVerifyString = null;
        user.resetTime = null;
        await user.save();

      return res.status(401).json({
          message: "OTP expired",
          error_code: 401,
        },
      );
    }

    const hashPashword = await bcrypt.hash(password, 10);
    user.password = hashPashword;
    user.pwdVerifyString = null;
    user.resetTime = null;

    await user.save();
    return res.status(200).json({
        message: "password successfully changed",
        error_code: 200,
      },
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async(req,res)=>{

  try {
    const users = await User.find()
    return res.status(200).json({
      messege:"Users Details Send Succesfully",
      data:users
    })

    
  } catch (error) {
    console.log(error)
    
  }

}
