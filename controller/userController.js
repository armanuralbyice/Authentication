const User = require('../model/userSchema')
const crypto = require('crypto')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsync = require('../middleware/catchAsyncError')
const {sendToken} = require('../middleware/sendToken')
const sendEmail = require("../utils/SendEmail");
exports.register = catchAsync( async (req, res) => {
    const {name, email, password} = req.body
    const user = await User.create({name, email, password})
    res.status(201).json({
        success: true,
        user
    })
})
exports.login = catchAsync (async (req, res, next) => {
    const {email, password} = req.body
    if(!email || !password){
        return next(new ErrorHandler('Please provide email and password', 400))
    }
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Invalid email or password', 401))
    }
    const isPasswordMatch = await user.comparePassword(password)
    if(!isPasswordMatch){
        return next(new ErrorHandler('Invalid email or password', 401))
    }
    await sendToken(user, 200, res)
})
exports.forgetPassword = catchAsync(async (req, res, next) => {
    const {email} = req.body
    if(!email){
        return next(new ErrorHandler('Please provide email', 400))
    }
    const user = await User.findOne({email})
    if(!user){
        return next(new ErrorHandler('Invalid email', 401))
    }
    const resetToken = await user.getResetPasswordToken()
    await user.save({validateBeforeSave: false})
    const resetUrl = `${req.protocol}://${req.get('host')}/api/user/reset/password/${resetToken}`
    const message = `Your password reset token is as follow:\n${resetUrl}\nIf you have not requested this email, then ignore it`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`,
            resetToken
        })
    }
    catch (err){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({validateBeforeSave: false})
        return next (new ErrorHandler(err.message, 500))
    }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    })
    if(!user){
        return next(new ErrorHandler('Invalid token', 400))
    }
    if(req.body.password!== req.body.confirmPassword){
        return next(new ErrorHandler('Passwords do not match', 400))
    }
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    await sendToken(user, 200, res)
})
exports.logoutUser = catchAsync(async (req, res, next) => {
    req.cookies('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

