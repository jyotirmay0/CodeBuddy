import {Router} from "express"
import {getCollectionStats, login, logout, refreshAccessToken, register, sendOTP, verifyOTP} from "../controllers/auth.js"
import {verifyJWT} from "../middleware/auth.js"

export const router=Router()

router.post("/register",register)
router.post("/login",login)
router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.get("/logout", verifyJWT, logout)
router.get("/refresh-token",refreshAccessToken)
router.get("/db",getCollectionStats)