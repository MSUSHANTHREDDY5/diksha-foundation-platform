import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../../models/User.js';
import { AppError } from '../../middleware/error.middleware.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error: AppError = new Error('Internal server error: JWT secret is not configured');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

const generateToken = (user: IUser): string => {
  const jwtSecret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    },
    jwtSecret,
    { expiresIn } as jwt.SignOptions
  );
};

const formatUserResponse = (user: IUser): UserResponse => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

export const registerUser = async (data: RegisterDTO): Promise<AuthResult> => {
  const { name, email, password, role } = data;

  const targetRole = role || 'STUDENT';
  const allowedPublicRoles: UserRole[] = ['STUDENT', 'TEACHER_VOLUNTEER'];

  if (!allowedPublicRoles.includes(targetRole as UserRole)) {
    const error: AppError = new Error(
      targetRole === 'ADMIN'
        ? 'Public registration of ADMIN role is not permitted'
        : 'Invalid role provided for registration'
    );
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error: AppError = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = new User({
    name,
    email,
    password,
    role: targetRole
  });

  await user.save();

  const token = generateToken(user);
  return {
    user: formatUserResponse(user),
    token
  };
};

export const loginUser = async (data: LoginDTO): Promise<AuthResult> => {
  const { email, password } = data;

  if (!email || !password) {
    const error: AppError = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error: AppError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error: AppError = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  return {
    user: formatUserResponse(user),
    token
  };
};

export const getCurrentUser = async (userId: string): Promise<UserResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    const error: AppError = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return formatUserResponse(user);
};
