import express from "express";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validation.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  refresh,
  register,
  login,
  getMe,
  verifyEmailToken,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route - /api/auth/register
 * @description - Register a new user
 * @access - public
 * @Response: { success, user, token }
 */
router.post("/register", validateRegister, register);

/**
 * @route - /api/auth/verify/:token
 * @description - Verify user email with token
 * @access - public
 */
router.get("/verify/:token", verifyEmailToken);

/**
 * @route - /api/auth/login
 * @description - Login a user
 * @access - public
 * Response: { success, user, token }
 */
router.post("/login", validateLogin, login);

/**
 * Refresh Token
 * Route: POST /api/auth/refresh
 * Headers: Authorization: Bearer <token>
 *
 * Process:
 * 1. Verify current JWT token (via verifyToken middleware)
 * 2. Generate new JWT token with same user data
 * 3. Return new token
 *
 * Response: { success, token }
 */
/**
 * @route - /api/auth/refresh
 * @description - Refresh JWT token
 * @access - private
 */
router.post("/refresh", verifyToken, refresh);

/**
 * Get Current User (Protected Route)
 * Route: GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 *
 * Process:
 * 1. Verify JWT token (via verifyToken middleware)
 * 2. Fetch user details from database
 * 3. Return user profile data
 *
 * Response: { success, user }
 */
/**
 * @route - /api/auth/me
 * @description - Get current user
 * @access - private
 */
router.get("/get-me", verifyToken, getMe);

/**
 * @route - /api/auth/logout
 * @description - Logout current user
 * @access - public
 */
router.post("/logout", logout);

export default router;
