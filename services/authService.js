import userService from "./userService.js";
import jwtUtils from "../utils/jwt.js";
import {
  USER_ROLES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
} from "../utils/constants.js";

class AuthService {
  // Register new user
  async register(userData) {
    const { email, name, password, role } = userData;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Create new user
    const newUser = await userService.createUser({
      email,
      name,
      password,
      role: role || USER_ROLES.USER,
    });

    // Generate tokens
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const tokens = jwtUtils.generateTokenPair(payload);

    return {
      user: newUser,
      ...tokens,
    };
  }

  // Login user
  async login(email, password) {
    // Find user by email (including password for verification)
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await userService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = jwtUtils.generateTokenPair(payload);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwtUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      );

      // Get user to ensure they still exist
      const user = await userService.getUserById(decoded.userId);

      if (!user) {
        return null;
      }

      // Generate new tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = jwtUtils.generateTokenPair(payload);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    return await userService.updateUser(userId, updateData);
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await userService.getUserByEmail(
      (await userService.getUserById(userId)).email,
    );

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await userService.verifyPassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return false;
    }

    // Update password
    await userService.updateUser(userId, { password: newPassword });

    return true;
  }

  // Verify JWT token and get user
  async verifyToken(token) {
    try {
      const decoded = jwtUtils.verifyToken(token);
      const user = await userService.getUserById(decoded.userId);

      return user;
    } catch (error) {
      return null;
    }
  }

  // Generate password reset token
  async generatePasswordResetToken(email) {
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      type: "password_reset",
    };

    const resetToken = jwtUtils.generateAccessToken(payload);

    return {
      resetToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Reset password with token
  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = jwtUtils.verifyToken(resetToken);

      if (decoded.type !== "password_reset") {
        return false;
      }

      // Update password
      await userService.updateUser(decoded.userId, { password: newPassword });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Validate email and password format
  validateCredentials(email, password) {
    const errors = [];

    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      errors.push("Invalid email format");
    }

    if (
      password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH ||
      !VALIDATION_RULES.PASSWORD_REGEX.test(password)
    ) {
      errors.push(
        `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters with uppercase, lowercase, and number`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new AuthService();
