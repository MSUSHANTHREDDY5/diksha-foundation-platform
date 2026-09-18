import { Request, Response, NextFunction } from 'express';
import * as progressService from './progress.service.js';

export const createProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const progress = await progressService.createProgress(studentId, req.body, req.user!.id);

    res.status(201).json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const result = await progressService.getProgressByStudentId(studentId, req.query, req.user!);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
