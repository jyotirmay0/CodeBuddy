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
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    pin:{
        type:String,
        required:true,
    },
    savedPasswords:[
        {
            name:String,
            password:String,
            created:{type:Date,default:Date.now},
            favourite:{type:Boolean,default:false}
        }
    ],
},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password, 10)
    this.pin=await bcrypt.hash(this.pin,10)
    next()
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.isPinCorrect=async function(pin){
    return await bcrypt.compare(pin, this.pin)
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