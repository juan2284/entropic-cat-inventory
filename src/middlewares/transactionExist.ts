import { Request, Response, NextFunction } from 'express';
import Transaction, { ITransaction } from '../models/Transaction.js';

declare global {
  namespace Express {
    interface Request {
      transaction: ITransaction
    }
  }
}

export async function transactionExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId).populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).populate({path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

    if (!transaction) {
      const error = new Error('transaction not found');
      return res.status(404).json({error: error.message});
    }

    req.transaction = transaction;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default transactionExists;