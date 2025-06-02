import authService from '../services/authService.js';
import { validationResult } from 'express-validator';
import responseUtils from '../utils/response.js';

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const userData = req.body;
      const result = await authService.register(userData);
      
      responseUtils.created(res, result, 'User registered successfully');
    } catch (error) {
      if (error.code === 'P2002') {
        return responseUtils.conflict(res, 'Email already exists');
      }
      
      responseUtils.internalError(res, error.message);
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      if (!result) {
        return responseUtils.unauthorized(res, 'Invalid email or password');
      }

      responseUtils.success(res, result, 'Login successful');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return responseUtils.badRequest(res, 'Refresh token is required');
      }

      const result = await authService.refreshToken(refreshToken);
      
      if (!result) {
        return responseUtils.unauthorized(res, 'Invalid refresh token');
      }

      responseUtils.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      responseUtils.unauthorized(res, 'Invalid refresh token');
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = req.user;
      responseUtils.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }

  // Update current user profile
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const userId = req.user.id;
      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.role;
      delete updateData.id;

      const updatedUser = await authService.updateProfile(userId, updateData);
      
      responseUtils.success(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      if (error.code === 'P2002') {
        return responseUtils.conflict(res, 'Email already exists');
      }
      
      responseUtils.internalError(res, error.message);
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.validationError(res, errors.array());
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      
      if (!result) {
        return responseUtils.badRequest(res, 'Current password is incorrect');
      }

      responseUtils.success(res, null, 'Password changed successfully');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }

  // Logout (invalidate token - this would require token blacklisting in production)
  async logout(req, res) {
    try {
      // In a real application, you would implement token blacklisting here
      // For now, we just return a success response
      responseUtils.success(res, null, 'Logged out successfully');
    } catch (error) {
      responseUtils.internalError(res, error.message);
    }
  }
}

export default new AuthController();