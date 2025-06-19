import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

/**
 * Controller for user authentication
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone, role, timezone } = req.body;

      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: role || 'STUDENT',
          timezone: timezone || 'UTC',
        },
      });

      // Create profile based on role
      if (role === 'TEACHER') {
        await prisma.teacherProfile.create({
          data: {
            userId: user.id,
            hourlyRate: 0, // Default value, to be updated later
            minLessonDuration: 30, // Default value: 30 minutes
            maxLessonDuration: 60, // Default value: 60 minutes
          },
        });
      } else if (role === 'STUDENT') {
        await prisma.studentProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === 'PARENT') {
        await prisma.parentProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      // Return user data and token (excluding the password)
      const { password: _, ...userData } = user;

      res.status(201).json({
        message: 'User registered successfully',
        user: userData,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login a user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Check if the user exists
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      // Return user data and token (excluding the password)
      const { password: _, ...userData } = user;

      res.status(200).json({
        message: 'Login successful',
        user: userData,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the current user's profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Not authenticated');
      }

      // Get user from database (to ensure we have the latest data)
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Get additional profile data based on user role
      let profileData = null;

      if (user.role === 'TEACHER') {
        profileData = await prisma.teacherProfile.findUnique({
          where: { userId: user.id },
        });
      } else if (user.role === 'STUDENT') {
        profileData = await prisma.studentProfile.findUnique({
          where: { userId: user.id },
        });
      } else if (user.role === 'PARENT') {
        profileData = await prisma.parentProfile.findUnique({
          where: { userId: user.id },
          include: {
            students: {
              include: {
                student: true,
              },
            },
          },
        });
      }

      // Return user data (excluding the password)
      const { password: _, ...userData } = user;

      res.status(200).json({
        user: userData,
        profile: profileData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change the user's password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Not authenticated');
      }

      const { currentPassword, newPassword } = req.body;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Check if the current password is correct
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}