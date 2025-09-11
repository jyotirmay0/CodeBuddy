import { app } from "./app.js"
import mongoose from "mongoose";
import http from 'node:http';
import process from "node:process";
import setupSocket from "./utils/socket.js";
import setupVideoRTC from "./utils/videortc.js";
import dotenv from "dotenv"
dotenv.config()

const connectDB=async()=>{
    try {
        const res=await mongoose.connect(`${process.env.MONGO_URL}`)
        console.log("DB connected on host: ",res.connection.host)
    } catch (error) {
        console.log("DB connection failed",error)
        process.exit(1)
    }
}

connectDB().then(()=>{
    const server=http.createServer(app)
    
    setupSocket(server);
    setupVideoRTC(server);

    server.listen(process.env.PORT,()=>{
        console.log(`Server running on PORT ${process.env.PORT}`)
    })
})