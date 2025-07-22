import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  time: { type: Date, default: Date.now }
});

const ProjectSchema=new mongoose.Schema({
    name:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },
    skills:{
        type:[String],
        default:[]
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [MessageSchema]
},{timestamps:true})

ProjectSchema.index({ name: 1 });

const Project=mongoose.model("Project",ProjectSchema)
export default Project