const mongoose = require('mongoose')

// const connectDB = async () =>{
//     try {
//         await mongoose.connect(process.env.DATABASE_URI)
//     } catch (error) {
//         console.log(error)
//     }
// }

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        // await mongoose.connect(process.env.DATABASE_URI);
        await mongoose.connect('mongodb://localhost:27017')
    } catch (err) {
        console.log(err);
    }
}
module.exports = connectDB
