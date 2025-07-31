import { app } from "./app.js"
import mongoose from "mongoose";
import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from "node:process";

const numCPUs = availableParallelism();

const connectDB=async()=>{
    try {
        const res=await mongoose.connect(`${process.env.MONGO_URL}`)
        console.log("DB connected on host: ",res.connection.host)
    } catch (error) {
        console.log("DB connection failed",error)
        process.exit(1)
    }
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
    connectDB().then(()=>{
        const server=http.createServer(app)
        server.listen(process.env.PORT||3002,()=>{
            console.log(`Server running on PORT ${process.env.PORT}`)
        })
    })
    .catch((err)=>console.error("DB connection failed. ",err))
}