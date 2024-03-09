const jwt = require('jsonwebtoken')
const {tokenLogger} = require('../logHandler')

const LOG_TYPE = {
    VERIFY_JWT:"jwt verification"
}

const LEVEL = {
    ERROR: "error"
}

const MESSAGE = {
    NO_TOKEN_FOUND:"token not found in header",
    INVALID_TOKEN:"invalid token, or might be changed"
}


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        tokenLogger(
            LOG_TYPE.VERIFY_JWT,
            LEVEL.ERROR,
            MESSAGE.NO_TOKEN_FOUND
        )
        return res.status(401).json({ message: 'Unauthorized token' })
        // surely user try to remove token from redux state
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err){
                tokenLogger(
                    LOG_TYPE.VERIFY_JWT,
                    LEVEL.ERROR,
                    MESSAGE.INVALID_TOKEN
                )
                return res.status(403).json({ message: 'Forbidden' })
            }

            req.email = decoded.UserInfo.email
            req.roles = decoded.UserInfo.roles
            next()
        }
    )
}

module.exports = verifyJWT