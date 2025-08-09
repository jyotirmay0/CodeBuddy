import mongoose from "mongoose";

const GroupSchema=new mongoose.Schema({
    name:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    skills:{
        type:[String],
        default:[]
    },
    // messages: ,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},{timestamps:true})

GroupSchema.index({ name: 1 });

const Group=mongoose.model("Group",GroupSchema)
export default Group