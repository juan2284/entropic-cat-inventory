import jwt from 'jsonwebtoken';

type UserPayload = {
  id: string | unknown;
};

export const generateJWT = (payload: UserPayload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '180d'
  });
  return token;
};