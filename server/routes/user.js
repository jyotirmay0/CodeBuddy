import { Router } from "express";
import {
  sendFriendRequet,
  acceptFriendRequest,
  friendList,
  friendSuggestions,
  uploadProfilePic,
  updateContact,
  friendDetails,
  userDetails,
  updatePassword,
  updateUserDetails
} from "../controllers/user.js";
import { verifyJWT } from "../middleware/auth.js";
import upload from "../middleware/multer.js"

export const router = Router();

router.post("/send-request", verifyJWT, sendFriendRequet);
router.post("/accept-request", verifyJWT, acceptFriendRequest);
router.get("/friends", verifyJWT, friendList);
router.get("/suggestions", verifyJWT, friendSuggestions);
router.post("/user-details",verifyJWT,friendDetails)
router.post('/upload-pic',verifyJWT, upload.single('image'), uploadProfilePic);
router.post("/update-contact",verifyJWT,updateContact)
router.get("/details",verifyJWT,userDetails)
router.post("/update-password",verifyJWT,updatePassword)
router.post("/upload-details",verifyJWT,updateUserDetails)