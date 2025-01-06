import { Request, Response } from 'express';
import Supplier, { ISupplier } from '@/models/Supplier.js';

export class SupplierController {

  static getSuppliers = async (req: Request, res: Response) => {
    try {
      const suppliers = await Supplier.find().select('-__v -createdAt -updatedAt');

      if (suppliers.length === 0) {
        const error = new Error('There are no registered suppliers yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(suppliers);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getSupplierById = async (req: Request, res: Response) => {
    const { supplier } = req;
    try {
      return res.json(supplier);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewSupplier = async (req: Request, res: Response) => {
    const supplier = new Supplier(req.body);
    const supplierExist = await Supplier.findOne({identity_number: req.body.identity_number});

    if (supplierExist) {
      const error = new Error('The supplier already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      await supplier.save();
      return res.json({msg: 'Supplier created successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editSupplier = async (req: Request, res: Response) => {
    const supplier: ISupplier = req.supplier;
    const updatedSupplier: ISupplier = req.body;
    const identityIDExist = await Supplier.find().where('identity_number').equals(updatedSupplier.identity_number);

    if (supplier.identity_number !== updatedSupplier.identity_number && identityIDExist.length !== 0) {
      const error = new Error('The identification number already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      supplier.identity_number = updatedSupplier.identity_number;
      supplier.name = updatedSupplier.name;
      supplier.last_name = updatedSupplier.last_name;
      supplier.telephone = updatedSupplier.telephone;
      supplier.email = updatedSupplier.email;

      await supplier.save();
      return res.json({msg: 'Supplier edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteSupplier = async (req: Request, res: Response) => {
    const { supplier } = req;
    try {
      await supplier.deleteOne();
      return res.json({msg: 'Supplier successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

}