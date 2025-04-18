/**
 * File: server/src/routes/user.ts
 * Protected user profile routes:
 *  - GET /user/:userId        → fetch public user details
 *  - POST /user/change‑username
 *  - PUT  /user/update‑details
 */

import { Router } from "express";
import {
  changeUsername,
  updateUserDetails,
  getUserDetails
} from "../controllers/userController";
import { authRequired } from "../middlewares/authMiddleware";

const router = Router();

// All /user endpoints require a valid JWT
router.use(authRequired);

// Change your chosen username
router.post("/change-username", changeUsername);

// Update profile fields (bio, interests, etc)
router.put("/update-details", updateUserDetails);

// Fetch any user’s public profile (hides phone)
router.get("/:userId", getUserDetails);

export default router;
