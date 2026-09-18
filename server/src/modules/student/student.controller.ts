import { Request, Response, NextFunction } from 'express';
import * as studentService from './student.service.js';

export const createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      data: { student }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await studentService.getStudents(req.query, req.user!);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await studentService.getStudentById(req.params.id, req.user!);
    res.status(200).json({
      success: true,
      data: { student }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: { student }
    });
  } catch (error) {
    next(error);
  }
};
