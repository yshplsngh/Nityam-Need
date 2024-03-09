const fs = require('fs')
const fsPromises = require('fs/promises')
const {v4:uuid} = require('uuid')
const {format} = require('date-fns')
const path = require('path')
const getCurrentContextData = require('../utils/contextData')


// parent method for logging
const logEvents = async (message,logFileName)=>{
    const dateTime = format(new Date() , 'ddMMyyyy\tHH:mm:SS')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){
            await fsPromises.mkdir(path.join(__dirname,'..','logs'))
        }
        await fsPromises.appendFile(path.join(__dirname,'..','logs',logFileName),logItem)
    } catch (error) {
        console.log(error)
    }
}


// log all incoming request
const reqHandler = (req,res,next) =>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`,'reqLog.log');
    console.log(`${req.method}\t${req.path}`)
    next()
}


// log all information
const infoLogger = (req,email,message,logtype,level)=>{
    let context = null;
    if(req){
        const {ip,country,city,browser,platform,os,device,deviceType} = getCurrentContextData(req);
        context = `IP:${ip}\t\tCountry:${country}\t\tCity:${city}\t\tBrowser:${browser}\t\tPlatform:${platform}\t\tOs:${os}\t\tDevice:${device}\t\tDeviseType:${deviceType}`
    }
    logEvents(`${email}\t\t${logtype}\t\t${level}\t\t${message}\t\t${context}`,'infoLog.log')
}


const tokenLogger = (logtype,level,message)=>{
    logEvents(`${logtype}\t\t${level}\t\t${message}`,'tokenLog.log')
}



module.exports = {logEvents,reqHandler,infoLogger,tokenLogger}