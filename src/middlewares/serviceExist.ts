import { Request, Response, NextFunction } from 'express';
import Service, { IService } from '../models/Service.js';

declare global {
  namespace Express {
    interface Request {
      service: IService
    }
  }
}

export async function serviceExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId).populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).populate({path: 'contact', model: 'Reminder', select: '-__v -updatedAt'}).select('-__v -createdAt -updatedAt');

    if (!service) {
      const error = new Error('Service not found');
      return res.status(404).json({error: error.message});
    }

    req.service = service;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default serviceExists;