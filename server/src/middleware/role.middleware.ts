import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.js';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions to access this resource'
      });
      return;
    }

    next();
  };
};
