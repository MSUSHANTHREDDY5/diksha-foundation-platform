import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service.js';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const centreFilter = req.query.centre as string | undefined;
    const data = await adminService.getDashboard(centreFilter);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getStudentAnalytics(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getProgramAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getProgramAnalytics(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getAssessmentAnalytics(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getStudentReports(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getProgramReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await adminService.getProgramReports(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
