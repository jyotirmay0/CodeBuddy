import crypto from 'crypto';
import redisClient from './RedisClient.js';

const getOTPKey = (email) => {
  const hashed = crypto.createHash('sha256').update(email).digest('hex');
  return `otp:${hashed}`;
};

export const saveOTP = async (email, otp) => {
  const key = getOTPKey(email);
  await redisClient.set(key, otp, { EX: process.env.OTP_EXPIRY_SECONDS });
};

export const getOTP = async (email) => {
  const key = getOTPKey(email);
  return await redisClient.get(key);
};

export const deleteOTP = async (email) => {
  const key = getOTPKey(email);
  await redisClient.del(key);
};
