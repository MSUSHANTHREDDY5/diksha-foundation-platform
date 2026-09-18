export interface JwtPayloadUser {
  id: string;
  role: 'ADMIN' | 'STUDENT' | 'TEACHER_VOLUNTEER';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}
