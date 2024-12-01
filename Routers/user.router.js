import express from "express"
import {activateUser, changePassword, forgetPassword, resendOTP, userLogin, userRegister } from "../Controllers/user.controller.js"

const router = express.Router()


router.post('/signup',userRegister)
router.post('/accountactivation',activateUser)
router.post('/resend-otp',resendOTP)
router.post('/login',userLogin)
router.post('/forgot-password',forgetPassword)
router.post('/change-password',changePassword)


export default router