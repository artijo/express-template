import userService from '../services/userService.js';
import { validationResult } from 'express-validator';
import responseUtils from '../utils/response.js';

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      responseUtils.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(parseInt(id));
      
      if (!user) {
        return responseUtils.notFound(res, 'User not found');
      }

      responseUtils.success(res, user, 'User retrieved successfully');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const userData = req.body;
      const newUser = await userService.createUser(userData);
      
      responseUtils.created(res, newUser, 'User created successfully');
    } catch (error) {
      if (error.code === 'P2002') {
        return responseUtils.conflict(res, 'Email already exists');
      }
      
      responseUtils.internalError(res, error.message);
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const { id } = req.params;
      const updateData = req.body;
      
      const updatedUser = await userService.updateUser(parseInt(id), updateData);
      
      responseUtils.success(res, updatedUser, 'User updated successfully');
    } catch (error) {
      if (error.code === 'P2025') {
        return responseUtils.notFound(res, 'User not found');
      }
      
      responseUtils.internalError(res, error.message);
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(parseInt(id));
      
      responseUtils.success(res, null, 'User deleted successfully');
    } catch (error) {
      if (error.code === 'P2025') {
        return responseUtils.notFound(res, 'User not found');
      }
      
      responseUtils.internalError(res, error.message);
    }
  }
}

export default new UserController();