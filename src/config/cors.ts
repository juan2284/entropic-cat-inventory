import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const ACCEPTED_ORIGINS = [
  process.env.FRONTEND_URL
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {    

    if (acceptedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
});