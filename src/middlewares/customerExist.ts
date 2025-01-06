import { Request, Response, NextFunction } from 'express';
import Customer, { ICustomer } from '@/models/Customer.js';

declare global {
  namespace Express {
    interface Request {
      customer: ICustomer
    }
  }
}

export async function customerExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      const error = new Error('Customer not found');
      return res.status(404).json({error: error.message});
    }

    req.customer = customer;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default customerExists;