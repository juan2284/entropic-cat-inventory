import { Request, Response, NextFunction } from 'express';
import Reminder, { IReminder } from '../models/Reminder.js';

declare global {
  namespace Express {
    interface Request {
      reminder: IReminder
    }
  }
}

export async function reminderExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { reminderId } = req.params;
    const reminder = await Reminder.findById(reminderId).populate({path: 'service', model: 'Service', populate: [
      {path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'},
      {path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'},
      {path: 'contact', model: 'Reminder', select: '-__v -createdAt -updatedAt'}
    ], select: '-__v -createdAt -updatedAt'}).select('-__v -updatedAt');

    if (!reminder) {
      const error = new Error('reminder not found');
      return res.status(404).json({error: error.message});
    }

    req.reminder = reminder;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default reminderExists;