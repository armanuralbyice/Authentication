const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter your name'],
        maxLength: [30, 'Your name must be less than 30 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please Enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter your valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please Enter your password'],
        minLength: [6, 'Your password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 8);
})
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.methods.getJwtToken = async function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}
userSchema.methods.getResetPasswordToken = function () {
    const restPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(restPasswordToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return restPasswordToken
}

module.exports = mongoose.model('User', userSchema);
