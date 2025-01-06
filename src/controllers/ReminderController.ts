import { Request, Response } from 'express';
import Reminder, { IReminder } from "@/models/Reminder.js";

export class ReminderController {

  static getReminders = async (req: Request, res: Response) => {
    try {
      const reminders = await Reminder.find().populate({path: 'service', model: 'Service', populate: [
        {path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'},
        {path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'},
        {path: 'contact', model: 'Reminder', select: '-__v -createdAt -updatedAt'}
      ], select: '-__v -createdAt -updatedAt'}).select('-__v -updatedAt');

      if (reminders.length === 0) {
        const error = new Error('There are no registered services yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(reminders);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getReminderById = (req: Request, res: Response) => {
    const { reminder } = req;
    try {
      return res.json(reminder);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewReminder = async (req: Request, res: Response) => {
    const reminder = new Reminder(req.body);
    try {
      reminder.save();
      return res.json({msg: 'Reminder registered successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editReminder = async (req: Request, res: Response) => {
    const reminder: IReminder = req.reminder;
    const updatedReminder: IReminder = req.body;

    try {
      reminder.service = updatedReminder.service !== undefined ? updatedReminder.service : reminder.service;
      reminder.result = updatedReminder.result !== undefined ? updatedReminder.result : reminder.result;

      await reminder.save();
      return res.json({msg: 'Reminder edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteReminder = async (req: Request, res: Response) => {
    const { reminder } = req;
    try {
      await reminder.deleteOne();
      return res.json({msg: 'Reminder successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

}