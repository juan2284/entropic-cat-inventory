import { Request, Response, NextFunction } from 'express';
import Charge, { ICharge } from '../models/Charge.js';

declare global {
  namespace Express {
    interface Request {
      charge: ICharge
    }
  }
}

export async function chargeExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { chargeId } = req.params;
    const charge = await Charge.findById(chargeId).populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'product.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

    if (!charge) {
      const error = new Error('Charge not found');
      return res.status(404).json({error: error.message});
    }

    req.charge = charge;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default chargeExists;