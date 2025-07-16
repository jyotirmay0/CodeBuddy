import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
dotenv.config()

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:6,
        max:30
    },
    name:{
        type:String,
        default:""
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    contact:{
        type:Number,
        default:null,
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    pic:{
        type: String,
        default: ""
    },
    skills:{
        type:[String],
        default:[]
    },
    interests:{
        type:[String],
        default:[]
    },
    hobbies:{
        type:[String],
        default:[]
    },
    friends:{
        type:[String],
        default:[]
    },
    projects:{
        type:[String],
        default:[]
    },
    groups:{
        type:[String],
        default:[]
    }
},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString()
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString()
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User=mongoose.model("User",UserSchema)
export default User