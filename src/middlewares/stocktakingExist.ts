import { Request, Response, NextFunction } from 'express';
import Stocktaking, { IStocktaking } from '@/models/Stocktaking.js';

declare global {
  namespace Express {
    interface Request {
      stocktaking: IStocktaking
    }
  }
}

export async function stocktakingExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { stockId } = req.params;
    const stocktaking = await Stocktaking.findById(stockId).populate({path: 'product', model: 'Product', select: '-__v -createdAt -updatedAt'}).populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt'}).populate({path: 'transactions.payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

    if (!stocktaking) {
      const error = new Error('Product not found');
      return res.status(404).json({error: error.message});
    }

    req.stocktaking = stocktaking;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default stocktakingExists;