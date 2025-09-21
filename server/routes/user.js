import { Router } from "express";
import {
  uploadProfilePic,
  updateContact,
  userDetails,
  updatePassword,
  updateUserDetails,
  sendBuddyRequet,
  acceptBuddyRequest,
  buddyList,
  buddySuggestions,
  buddyDetails,
  dashboardStats,
  discoverUsers
} from "../controllers/user.js";
import { verifyJWT } from "../middleware/auth.js";
import upload from "../middleware/multer.js"

export const router = Router();

router.post("/send-request/:buddyId", verifyJWT, sendBuddyRequet);
router.patch("/buddy-requests/:buddyId/accept", verifyJWT, acceptBuddyRequest);
router.get("/buddies", verifyJWT, buddyList);
router.get("/buddy-suggestions", verifyJWT, buddySuggestions);
router.get("/buddy-details/:id",verifyJWT,buddyDetails)
router.post('/upload-pic',verifyJWT, upload.single('image'), uploadProfilePic);
router.patch("/update-contact",verifyJWT,updateContact)
router.get("/details",verifyJWT,userDetails)
router.patch("/update-password",verifyJWT,updatePassword)
router.patch("/update-details",verifyJWT,updateUserDetails)
router.get("/discover", verifyJWT, discoverUsers);
router.get("/stats", verifyJWT, dashboardStats);