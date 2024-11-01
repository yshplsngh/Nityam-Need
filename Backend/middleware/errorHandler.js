const {logEvents} = require('./logHandler')

const errorHandler = async(err,req,res,next) =>{
    logEvents(`${err.name}:${err.message}\t${req.url}\t${req.method}\t${req.headers.origin}`,'errLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500
    res.status(status)

    res.json({message:err.message})
}
module.exports = errorHandler