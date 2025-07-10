import {Router} from "express"
import {login, logout, refreshAccessToken, register, updatePassword, userDetails} from "../controllers/auth.js"
import {verifyJWT} from "../middleware/auth.js"

export const router=Router()

router.post("/register",register)
router.post("/login",login)
router.get("/logout", verifyJWT, logout)
router.get("/details",verifyJWT,userDetails)
router.post("/update-password",verifyJWT,updatePassword)
router.get("/refresh-token",refreshAccessToken)