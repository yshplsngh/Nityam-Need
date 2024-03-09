const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v2: cloudinary } = require('cloudinary')
const { infoLogger, tokenLogger } = require('../middleware/logHandler')

const LOG_TYPE = {
    SIGN_IN: "login",
    SIGN_UP: "sign up",
    REFRESH_ACCESS_TOKEN: "refresh access token",
    LOG_OUT: "log out"
}

const LEVEL = {
    INFO: "info",
    ERROR: "error",
    WARN: 'warn'
}

const MESSAGE = {
    SIGN_IN_ATTEMP: "User attemting to login",
    SIGN_UP_ATTEMP: "User attemping to sign up",
    INCORRECT_EMAIL: "Incorrect email, not found in DB",
    INCORRECT_PASSWORD: "Incorrect password for email",
    DUPLICATE_EMAIL: "Email already found in db",
    DUPLICATE_PHONENUMBER: "Phone number already found in db",
    USER_CREATED: "new user created successfully",
    USER_NOT_CREATED: "something went wrong while register new user",
    LOGOUT_SUCCESS: "User has logged out successfully",
    MISSING_REFRESH_TOKEN: "refresh token not found in cokies",
    INVALID_REFRESH_TOKEN: "invalid refresh token user might have changed it",
    CHANGED_REFRESH_TOKEN: "user must change the email from refresh token"
}



// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    infoLogger(
        req,
        req.body.email ? req.body.email : null,
        MESSAGE.SIGN_IN_ATTEMP,
        LOG_TYPE.SIGN_IN,
        LEVEL.INFO
    )

    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //if you don't use exec() its fine.but by using this you get a better stack trace if any error happened
    const foundUser = await User.findOne({ email: { $eq: email } }).exec()
    if (!foundUser) {
        infoLogger(
            req,
            email,
            MESSAGE.INCORRECT_EMAIL,
            LOG_TYPE.SIGN_IN,
            LEVEL.ERROR
        )
        return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) {
        infoLogger(
            req,
            email,
            MESSAGE.INCORRECT_PASSWORD,
            LOG_TYPE.SIGN_IN,
            LEVEL.ERROR
        )
        return res.status(401).json({ message: 'Invalid credentials' })
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundUser.email,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' }
    )

    const refreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: 'None', //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })

    // Send accessToken containing email and roles
    res.json({ accessToken })
}




// @desc signup
// @route POST /auth/signup
// @access public
const signup = async (req, res) => {
    const { name, password, email, phoneNumber, city, address, postalCost } = req.body;

    infoLogger(
        req,
        email ? email : null,
        MESSAGE.SIGN_UP_ATTEMP,
        LOG_TYPE.SIGN_UP,
        LEVEL.INFO
    )

    if (!name || !password || !email || !phoneNumber || !city || !address || !postalCost) {
        return res.status(400).json({ message: "all field are required" })
    }

    const foundEmail = await User.findOne({ email: { $eq: email } }).lean().exec();
    if (foundEmail) {
        infoLogger(
            req,
            email ? email : null,
            MESSAGE.DUPLICATE_EMAIL,
            LOG_TYPE.SIGN_UP,
            LEVEL.WARN
        )
        return res.status(409).json({ message: 'duplicate email' })
    }

    const foundPhoneNumber = await User.findOne({ phoneNumber: { $eq: phoneNumber } }).lean().exec();
    if (foundPhoneNumber) {
        infoLogger(
            req,
            email ? email : null,
            MESSAGE.DUPLICATE_PHONENUMBER,
            LOG_TYPE.SIGN_UP,
            LEVEL.WARN
        )
        return res.status(409).json({ message: 'duplicate phone number' })
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = { name, email, password: hashedPassword, phoneNumber, city, address, postalCost }

    const user = await User.create(userObject)

    if (user) {
        infoLogger(
            req,
            email ? email : null,
            MESSAGE.USER_CREATED,
            LOG_TYPE.SIGN_UP,
            LEVEL.INFO
        )
        res.status(201).json({ message: `${user.name} created with ${user.email}` })
    } else {
        infoLogger(
            req,
            email ? email : null,
            MESSAGE.USER_NOT_CREATED,
            LOG_TYPE.SIGN_UP,
            LEVEL.ERROR
        )
        res.status(400).json({ message: 'invalid user data received' })
    }
}



// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        tokenLogger(
            LOG_TYPE.REFRESH_ACCESS_TOKEN,
            LEVEL.ERROR,
            MESSAGE.MISSING_REFRESH_TOKEN
        )
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                tokenLogger(
                    LOG_TYPE.REFRESH_ACCESS_TOKEN,
                    LEVEL.ERROR,
                    MESSAGE.INVALID_REFRESH_TOKEN
                )
                return res.status(403).json({ message: 'Forbidden, your login has expired' })
            }
            const foundUser = await User.findOne({ email: { $eq: decoded.email } }).exec()

            if (!foundUser) {
                tokenLogger(
                    LOG_TYPE.REFRESH_ACCESS_TOKEN,
                    LEVEL.ERROR,
                    MESSAGE.CHANGED_REFRESH_TOKEN
                )
                return res.status(401).json({ message: 'Unauthorized, login again' })
            }

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            )

            res.json({ accessToken })
        }
    )
}



// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        infoLogger(
            req,
            null, // here provide email as possible
            MESSAGE.MISSING_REFRESH_TOKEN,
            LOG_TYPE.LOG_OUT,
            LEVEL.ERROR
        )
        return res.sendStatus(204)
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    infoLogger(
        req,
        null, // here provide email as possible
        MESSAGE.LOGOUT_SUCCESS,
        LOG_TYPE.LOG_OUT,
        LEVEL.INFO
    )
    res.json({ message: 'Cookie cleared' })
}



// @desc generateSignature
// @route POST /auth/generateSignature
// @access public
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
const generateSignature = (req, res) => {
    const { folder } = req.body
    if (!folder) {
        res.status(400).json({ message: 'unexpected error' })
    }
    const timestamp = Math.round((new Date).getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request({
        timestamp,
        folder
    }, process.env.CLOUDINARY_API_SECRET)
    res.status(200).json({ timestamp, signature });
}



// @desc uploadDocumentUrl
// @route PUT /auth/uploadDocumentUrl
// @access public
const uploadDocumentUrl = async (req, res) => {
    // console.log(req)
    const { aurl, purl } = req.body;
    const email = req.email
    // console.log(email)
    if (!aurl || !purl) {
        return res.status(400).json({ message: 'document Url not found' })
    }
    if (!email) {
        return res.status(400).json({ message: "email not found in web token" })
    }
    const foundUser = await User.findOne({ email }).exec()

    if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

    foundUser.panUrl = purl
    foundUser.aadharUrl = aurl
    foundUser.verification = "I"

    await foundUser.save()

    res.status(200).json({ message: "document upload successfully" })
}


// under Construction
const verifyDocument = async (req,res)=>{
    console.log(req)

    // console.log(file)
    console.log('verify in backend')
    res.status(200).json({message:'document uploaded successfully'})
}

module.exports = {
    login,
    refresh,
    logout,
    signup,
    verifyDocument
}