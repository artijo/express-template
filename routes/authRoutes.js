import express from "express";
import authController from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  createUserValidation,
  updateUserValidation,
  loginValidation,
} from "../validators/userValidator.js";
import { changePasswordValidation } from "../validators/authValidator.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes
router.post('/register', strictLimiter, createUserValidation, authController.register);
router.post('/login', strictLimiter, loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put(
  '/profile',
  authenticateToken,
  updateUserValidation,
  authController.updateProfile,
);
router.post(
  '/change-password',
  authenticateToken,
  strictLimiter,
  changePasswordValidation,
  authController.changePassword,
);
router.post('/logout', authenticateToken, authController.logout);

export default router;
