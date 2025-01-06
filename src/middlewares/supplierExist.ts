import { Request, Response, NextFunction } from 'express';
import Supplier, { ISupplier } from '@/models/Supplier.js';

declare global {
  namespace Express {
    interface Request {
      supplier: ISupplier
    }
  }
}

export async function supplierExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      const error = new Error('Supplier not found');
      return res.status(404).json({error: error.message});
    }

    req.supplier = supplier;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Ha ocurrido un error'});
  }
}

export default supplierExists;