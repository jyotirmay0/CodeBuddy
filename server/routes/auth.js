import {Router} from "express"
import {login, logout, refreshAccessToken, register, sendOTP, updatePassword, updateUserDetails, uploadProfilePic, userDetails, verifyOTP} from "../controllers/auth.js"
import {verifyJWT} from "../middleware/auth.js"
import upload from "../middleware/multer.js"

export const router=Router()

router.post("/register",register)
router.post("/login",login)
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.get("/logout", verifyJWT, logout)
router.get("/details",verifyJWT,userDetails)
router.post("/update-password",verifyJWT,updatePassword)
router.get("/refresh-token",refreshAccessToken)
router.post("/upload-details",verifyJWT,updateUserDetails)
router.post('/upload-pic',verifyJWT, upload.single('image'), uploadProfilePic);