const express = require('express');
const {register, login, forgetPassword, logoutUser, resetPassword} = require("../controller/userController");
const router = express.Router();

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/forget/password').post(forgetPassword)
router.route('/reset/password/:token').put(resetPassword)
router.route('/logout').get(logoutUser)

module.exports =router;
