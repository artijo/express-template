import prisma from '../prisma/index.js';
import bcrypt from 'bcrypt';
import { USER_ROLES, SECURITY_CONFIG } from '../utils/constants.js';

class UserService {
  // Get all users
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        }
      }
    });
  }

  // Get user by ID
  async getUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            published: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  // Get user by email
  async getUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  // Create new user
  async createUser(userData) {
    const { email, name, password, role } = userData;
    
    // Hash password
    const saltRounds = SECURITY_CONFIG.BCRYPT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || USER_ROLES.USER
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return newUser;
  }

  // Update user
  async updateUser(id, updateData) {
    const { password, ...otherData } = updateData;
    
    let dataToUpdate = { ...otherData };
    
    // Hash password if provided
    if (password) {
      const saltRounds = SECURITY_CONFIG.BCRYPT_ROUNDS;
      dataToUpdate.password = await bcrypt.hash(password, saltRounds);
    }

    return await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  // Delete user
  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user posts
  async getUserPosts(userId) {
    return await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Search users
  async searchUsers(searchTerm) {
    return await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
  }
}

export default new UserService();