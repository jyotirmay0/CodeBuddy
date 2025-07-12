import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

const generateAccessAndRefreshToken=async(id)=>{
  try {
    const user=await User.findById(id)
    if(!user)throw new ApiError(404, "User not found while generating tokens");
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
} 

export const register=asyncHandler(async(req,res)=>{
  const {username,name,email,contact,password}=req.body

  if([username,email,password].some((e)=>e==="")){
      throw new ApiError(400,"All fields are required")
  }

  const existingUser=await User.findOne({$or:[{username},{email},{contact}]})
  if(existingUser)throw new ApiError(400,"user with this credentials already exists");

  const user=await User.create({
      username:username.toLowerCase(),
      name,
      email,
      contact,
      password,
  })
  const createdUser=await User.findById(user._id)
  if(!createdUser)throw new ApiError(500,"Error creating user");

  return res.status(201).json(
      new ApiResponse(201, null, "user registered successfully")
  )
})

export const login=asyncHandler(async(req,res)=>{
  const {credential,password}=req.body

  if(!credential||!password)throw new ApiError(400,"username/email/contact and password required");
  
  const user = await User.findOne({
    $or: [
      { username: credential },
      { email: credential },
      { contact: credential }
    ]
  });
  if(!user)throw new ApiError(400,"user doesnot exist");

  const matchPassword=await user.isPasswordCorrect(password)
  if(!matchPassword)throw new ApiError(401,"Incorrect password");

  const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

  return res.status(200)
  .json(new ApiResponse(200,{accessToken, refreshToken},"user logged in succesfully"))
})

export const logout=asyncHandler(async(req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  
  return res.status(200)
  .json(new ApiResponse(200,null,"User logged out successfully"))
})

export const userDetails=asyncHandler(async(req,res)=>{
  if(!req.user)throw new ApiError(401,"User not authenticated");
  return res.status(200).json(
    new ApiResponse(200,{username:req.user.username,email:req.user.email},"User fetched successfully")
  )
})

export const updatePassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  if (!oldPassword || !newPassword || oldPassword.trim() === "" || newPassword.trim() === "") {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user=await User.findById(req.user._id)
  if(!user)throw new ApiError(400, "User doesnot exist");

  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect)throw new ApiError(401,"Incorrect original password");

  user.password=newPassword

  await user.save({validateBeforeSave:false})

  return res.status(200).json(
    new ApiResponse(200,null,"Password Changed Successfully")
  )
})

export const refreshAccessToken=asyncHandler(async(req, res)=>{
  const incomingRefreshToken = req.headers["x-refresh-token"];
  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized request")
  }
  try {
    const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user=await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401, "Invalid refresh token")
    }
    if(!user?.refreshToken || incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)
  
    return res.status(200)
    .json(new ApiResponse(200,{accessToken, refreshToken},"Access token refreshed"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})
