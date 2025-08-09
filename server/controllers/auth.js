import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { saveOTP,deleteOTP,getOTP } from '../utils/otpRedis.js';
import { sendMail } from '../utils/SendMail.js';

const generateAccessAndRefreshToken=async(id)=>{
  try {
    const user=await User.findById(id)
    if(!user)throw new ApiError(404, "User not found while generating tokens");
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const generateAccessToken=async(id)=>{
  try {
    const user=await User.findById(id)
    if(!user)throw new ApiError(404, "User not found while generating tokens");
    const accessToken=user.generateAccessToken()

    return {accessToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
} 

export const register=asyncHandler(async(req,res)=>{
  const {username,email,password}=req.body

  if([username,email,password].some((e)=>e==="")){
      throw new ApiError(400,"All fields are required")
  }

  const existingUser=await User.findOne({$or:[{username},{email}]})
  if(existingUser && existingUser.verified)throw new ApiError(400,"user with this credentials already exists");
  if(existingUser && !existingUser.verified)await User.findByIdAndDelete(existingUser._id);

  const user=await User.create({
      username:username.toLowerCase(),
      email,
      password,
  })
  const createdUser=await User.findById(user._id)
  if(!createdUser)throw new ApiError(500,"Error creating user");

  return res.status(201).json(
      new ApiResponse(201, null, "please verify email in next step")
  )
})

export const login=asyncHandler(async(req,res)=>{
  const {credential,password}=req.body

  if(!credential||!password)throw new ApiError(400,"username/email and password required");
  
  const user = await User.findOne({
    $or: [
      { username: credential },
      { email: credential },
    ]
  });
  if(!user)throw new ApiError(400,"user doesnot exist");
  if(user && !user.verified)throw new ApiError(400,"please verify email");

  const matchPassword=await user.isPasswordCorrect(password)
  if(!matchPassword)throw new ApiError(401,"Incorrect password");

  const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200)
  .json(new ApiResponse(200,{accessToken, refreshToken},"user logged in succesfully"))
})

export const logout=asyncHandler(async(req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: ""
      }
    },
    {
      new: true
    }
  )
  
  return res.status(200)
  .json(new ApiResponse(200,null,"User logged out successfully"))
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
    if(!user || user.refreshToken !== incomingRefreshToken){
      throw new ApiError(401, "Invalid refresh token")
    }
    const {accessToken}=await generateAccessToken(user._id)
  
    return res.status(200)
    .json(new ApiResponse(200,{accessToken, refreshToken:incomingRefreshToken},"Access token refreshed"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if(user && user.verified)throw new ApiError(400, "User already verified");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await saveOTP(email, otp);
  await sendMail(email, "Your OTP Code", `Your OTP is: ${otp}`);

  return res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const storedOTP = await getOTP(email);
  if (!storedOTP) throw new ApiError(401, "OTP expired or not found");
  if (storedOTP !== otp) throw new ApiError(401, "Invalid OTP");

  await deleteOTP(email);

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if(user && user.verified)throw new ApiError(400, "User already verified");

  user.verified = true;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { accessToken, refreshToken }, "OTP verified and user verified successfully")
  );
});