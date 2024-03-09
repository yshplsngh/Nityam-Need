const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/auth/loginLimiter')
const verifyJWT = require('../middleware/auth/verifyJWT')
const requestIp = require('request-ip')
const useragent = require('express-useragent')
const userDataValidator = require('../middleware/auth/usersValidator')
const documentUpload = require('../middleware/auth/documentUpload')


// in future in will add email verfication middleware
router.route('/login')
    .post(
        loginLimiter,
        requestIp.mw(),
        useragent.express(),
        authController.login,
    )


// in future i will write code for userDataValidator(empty)
router.route('/signup')
    .post(
        loginLimiter,
        requestIp.mw(),
        useragent.express(),
        // userDataValidator,
        authController.signup
    )


router.route('/refresh')
    .get(authController.refresh)


router.route('/logout')
    .post(authController.logout)


// router.route('/generateSignature')
//     .post(authController.generateSignature)


router.route('/verifyDocument')
    .post(
        // verifyJWT,
        // upload.fields([
        //     {
        //         name:"pan",
        //         maxCount: 1
        //     },
        //     {
        //         name:"aadhar",
        //         maxCount:1
        //     }
        // ]),
        documentUpload,
        authController.verifyDocument
    )


module.exports = router