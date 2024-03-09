require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const {logEvents,reqHandler} = require('./middleware/logHandler')
const errorHandler = require('./middleware/errorHandler')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500
const cors = require('cors')
const corsOption = require('./config/corsOption')


console.log(process.env.PROJECT_MODE)

//--database connection
connectDB()
//--request logging
app.use(reqHandler)
//--cors permisstion
app.use(cors(corsOption))
//--parse JSON from incoming requset payload
app.use(express.json())
//--exract cookies from request
app.use(cookieParser())


app.use('/auth',require('./routes/authRoutes'))
app.use('/user',require('./routes/userRoutes'))

// app.use(express.static("public"))
//--request error logging
app.use(errorHandler)

//--server running
mongoose.connection.once('open',()=>{
    console.log('connected to MONGODB');
    app.listen(PORT,() => console.log(`server running on ${PORT}`))
})

//--handle mongodb error
mongoose.connection.on('error',err=>{
    if(err.code === undefined && err.reason.type === "ReplicaSetNoPrimary"){
        logEvents(`${err.reason.type}\t\t${"ip blacklist error!"}`,'mongoErrLog.log')
    }else{
        logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log')
    }
    console.log(err)
})