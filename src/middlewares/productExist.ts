import { Request, Response, NextFunction } from 'express';
import Product, { IProduct } from '../models/Product.js';

declare global {
  namespace Express {
    interface Request {
      product: IProduct
    }
  }
}

export async function productExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      const error = new Error('Product not found');
      return res.status(404).json({error: error.message});
    }

    req.product = product;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default productExists;