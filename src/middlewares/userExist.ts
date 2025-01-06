import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '@/models/User.js';

declare global {
  namespace Express {
    interface Request {
      userAdmin: IUser
    }
  }
}

export async function userExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      return res.status(404).json({error: error.message});
    }

    req.userAdmin = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default userExists;