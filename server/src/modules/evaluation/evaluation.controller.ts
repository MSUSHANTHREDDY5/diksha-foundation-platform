import { Request, Response, NextFunction } from 'express';
import * as evaluationService from './evaluation.service.js';

export const createSelfEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const selfEvaluation = await evaluationService.createSelfEvaluation(studentId, req.body, req.user!);

    res.status(201).json({
      success: true,
      data: { selfEvaluation }
    });
  } catch (error) {
    next(error);
  }
};

export const getSelfEvaluations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const selfEvaluations = await evaluationService.getSelfEvaluationsByStudentId(studentId, req.user!);

    res.status(200).json({
      success: true,
      data: { selfEvaluations }
    });
  } catch (error) {
    next(error);
  }
};

export const createPeerReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const peerReview = await evaluationService.createPeerReview(studentId, req.body, req.user!);

    res.status(201).json({
      success: true,
      data: { peerReview }
    });
  } catch (error) {
    next(error);
  }
};

export const getPeerReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id;
    const peerReviews = await evaluationService.getPeerReviewsByStudentId(studentId, req.user!);

    res.status(200).json({
      success: true,
      data: { peerReviews }
    });
  } catch (error) {
    next(error);
  }
};
