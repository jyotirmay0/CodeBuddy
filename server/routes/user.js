import { Router } from "express";
import {
  sendFriendRequet,
  acceptFriendRequest,
  friendList,
  friendSuggestions,
  userDetails
} from "../controllers/user.js";
import { verifyJWT } from "../middleware/auth.js";

export const router = Router();

router.post("/send-request", verifyJWT, sendFriendRequet);
router.post("/accept-request", verifyJWT, acceptFriendRequest);
router.get("/friends", verifyJWT, friendList);
router.get("/suggestions", verifyJWT, friendSuggestions);
router.post("/user-details",verifyJWT,userDetails)