import { Router } from "express";
import {
  createProject,
  requestToJoinProject,
  acceptJoinRequest,
  closeProject,
  getAllOpenProjects,
  getMyProjects
} from "../controllers/project.js";
import { verifyJWT } from "../middleware/auth.js";

export const router = Router();

router.post("/create", verifyJWT, createProject);
router.post("/request-join", verifyJWT, requestToJoinProject);
router.post("/accept-join", verifyJWT, acceptJoinRequest);
router.post("/close", verifyJWT, closeProject);
router.get("/open", verifyJWT, getAllOpenProjects);
router.get("/my-projects", verifyJWT, getMyProjects);
