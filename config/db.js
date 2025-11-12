const mongoose=require('mongoose')
require('dotenv').config()
const mongoURI=process.env.MongoDBURI
console.log(mongoURI)


const connectDB=async()=>{
    try {
        const connect=await mongoose.connect(mongoURI)
        console.log(`connection success ${connect.connection.name}`)
    } catch (error) {
        console.log(error)
    }
}

module.exports=connectDB