import { Request, Response, NextFunction } from 'express';
import * as programService from './program.service.js';

export const createProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const program = await programService.createProgram(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { program }
    });
  } catch (error) {
    next(error);
  }
};

export const getPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await programService.getPrograms(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProgramById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const program = await programService.getProgramById(req.params.id);
    res.status(200).json({
      success: true,
      data: { program }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const program = await programService.updateProgram(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: { program }
    });
  } catch (error) {
    next(error);
  }
};

export const enrollStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const programId = req.params.id;
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: 'studentId is required for program enrollment'
      });
      return;
    }

    const enrollment = await programService.enrollStudentInProgram(programId, studentId, req.user!.id);
    res.status(201).json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
};

export const getProgramEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollments = await programService.getProgramEnrollments(req.params.id);
    res.status(200).json({
      success: true,
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const enrollments = await programService.getStudentPrograms(studentId, req.user!);
    res.status(200).json({
      success: true,
      data: { enrollments }
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const programId = req.params.id;
    const activity = await programService.createActivity(programId, req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    next(error);
  }
};

export const getProgramActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activities = await programService.getProgramActivities(req.params.id);
    res.status(200).json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activity = await programService.updateActivity(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    next(error);
  }
};
