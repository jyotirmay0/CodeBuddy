import { app } from "./app.js"
import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        const res=await mongoose.connect(`${process.env.MONGO_URL}`)
        console.log("DB connected on host: ",res.connection.host)
    } catch (error) {
        console.log("DB connection failed",error)
        process.exit(1)
    }
}

connectDB()
.then(()=>{
    app.listen(process.env.PORT||3002,()=>{
        console.log(`Server running on PORT ${process.env.PORT}`)
    })
})
.catch((err)=>console.error("DB connection failed. ",err))