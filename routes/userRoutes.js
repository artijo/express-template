import express from "express";
import userController from "../controllers/userController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
import {
  createUserValidation,
  updateUserValidation,
} from "../validators/userValidator.js";

const router = express.Router();

// Public routes
// router.get('/', userController.getAllUsers);
// router.get('/:id', userController.getUserById);

// Protected routes (require authentication)
router.post('/', createUserValidation, userController.createUser);
router.put(
  '/:id',
  authenticateToken,
  updateUserValidation,
  userController.updateUser
);
router.delete(
  '/:id',
  authenticateToken,
  authorize("ADMIN"),
  userController.deleteUser
);

export default router;
