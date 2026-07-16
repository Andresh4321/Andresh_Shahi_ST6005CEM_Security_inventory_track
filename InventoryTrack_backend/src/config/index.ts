import dotenv from 'dotenv';
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/defaultdb';
export const JWT_SECRET: string = process.env.JWT_SECRET || 'default';
export const SESSION_SECRET: string = process.env.SESSION_SECRET || 'session_secret_key_2024';
export const ENCRYPTION_KEY: string = process.env.ENCRYPTION_KEY || 'aes_encryption_key_32chars!!!';
export const PASSWORD_EXPIRY_DAYS: number = parseInt(process.env.PASSWORD_EXPIRY_DAYS || '90');
export const MAX_LOGIN_ATTEMPTS: number = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '10');
export const LOCKOUT_DURATION_MINUTES: number = parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30');
export const RATE_LIMIT_WINDOW_MS: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
export const RATE_LIMIT_MAX_REQUESTS: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
