import { Request, Response, NextFunction } from 'express';
import * as assessmentService from './assessment.service.js';

export const createAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const result = await assessmentService.createAssessment(studentId, req.body, req.user!.id);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessmentId = req.params.id;
    const result = await assessmentService.updateAssessment(assessmentId, req.body, req.user!.id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAssessments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const result = await assessmentService.getAssessmentsByStudentId(studentId, req.query, req.user!);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessmentId = req.params.id;
    const assessment = await assessmentService.getAssessmentById(assessmentId, req.user!);

    res.status(200).json({
      success: true,
      data: { assessment }
    });
  } catch (error) {
    next(error);
  }
};
