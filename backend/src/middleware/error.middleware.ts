import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: 'error',
    });
  }
  
  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (err.code === 'P2002') {
      const field = err.meta?.target as string[] || ['field'];
      return res.status(409).json({
        message: `A record with this ${field.join(', ')} already exists.`,
        status: 'error',
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
      });
    }
    
    // Handle record not found
    if (err.code === 'P2001' || err.code === 'P2018') {
      return res.status(404).json({
        message: 'Record not found',
        status: 'error',
        code: 'RECORD_NOT_FOUND',
      });
    }
    
    // Handle foreign key constraint failures
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: 'Related record not found',
        status: 'error',
        code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
      });
    }
    
    // Handle other Prisma errors
    return res.status(500).json({
      message: 'Database error',
      status: 'error',
      code: err.code,
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      status: 'error',
      code: 'VALIDATION_ERROR',
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Invalid or expired token',
      status: 'error',
      code: 'AUTHENTICATION_ERROR',
    });
  }
  
  // Handle all other errors as internal server errors
  return res.status(500).json({
    message: 'Internal server error',
    status: 'error',
  });
};