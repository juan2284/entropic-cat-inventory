import { Request, Response, NextFunction } from 'express';
import Payment, { IPayment } from '../models/Payment.js';

declare global {
  namespace Express {
    interface Request {
      payment: IPayment
    }
  }
}

export async function paymentExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'products.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

    if (!payment) {
      const error = new Error('Payment not found');
      return res.status(404).json({error: error.message});
    }

    req.payment = payment;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default paymentExists;