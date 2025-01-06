import { Request, Response } from 'express';
import Stocktaking, { IStocktaking } from "../models/Stocktaking.js";

export class StocktakingController {

  static getAllStock = async (req: Request, res: Response) => {
    try {
      const stock = await Stocktaking.find().populate({path: 'product', model: 'Product', select: '-__v -createdAt -updatedAt'}).populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt'}).populate({path: 'transactions.payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

      if (stock.length === 0) {
        const error = new Error('There are no registered products yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(stock);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getStockById = async (req: Request, res: Response) => {
    const { stocktaking } = req;
    try {
      return res.json(stocktaking);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getStockByProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    try {
      const productStock = await Stocktaking.find().where('product').equals(productId).populate({path: 'product', model: 'Product', select: '-__v -createdAt -updatedAt'}).populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt'}).populate({path: 'transactions.payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

      return res.json(productStock);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getStockByCharge = async (req: Request, res: Response) => {
    const { chargeId } = req.params;
    try {
      const chargeStock = await Stocktaking.find().where('charge').equals(chargeId).populate({ path: 'product', model: 'Product', select: '-__v -createdAt -updatedAt' }).populate({ path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt' }).populate({ path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt' }).populate({ path: 'transactions.payment', model: 'Payment', select: '-__v -createdAt -updatedAt' }).select('-__v -createdAt -updatedAt');

      return res.json(chargeStock);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({ error: err.message });
    }
  }

  static addNewStock = async (req: Request, res: Response) => {
    const stock = new Stocktaking(req.body);

    try {
      await stock.save();
      return res.json({msg: 'Stock created successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editStocktaking = async (req: Request, res: Response) => {
    const stocktaking: IStocktaking = req.stocktaking;
    const updatedStocktaking: IStocktaking = req.body;
    
    try {
      stocktaking.product = updatedStocktaking.product !== undefined ? updatedStocktaking.product : stocktaking.product;
      stocktaking.price_one = updatedStocktaking.price_one !== undefined ? updatedStocktaking.price_one : stocktaking.price_one;
      stocktaking.price_two = updatedStocktaking.price_two !== undefined ? updatedStocktaking.price_two : stocktaking.price_two;
      stocktaking.quantity = updatedStocktaking.quantity !== undefined ? updatedStocktaking.quantity : stocktaking.quantity;
      stocktaking.supplier = updatedStocktaking.supplier !== undefined ? updatedStocktaking.supplier : stocktaking.supplier;
      stocktaking.charge = updatedStocktaking.charge !== undefined ? updatedStocktaking.charge : stocktaking.charge;
      stocktaking.remaining = updatedStocktaking.remaining !== undefined ? updatedStocktaking.remaining : stocktaking.remaining;
      stocktaking.stock_out = updatedStocktaking.stock_out !== undefined ? updatedStocktaking.stock_out : stocktaking.stock_out;
      if (updatedStocktaking.transactions !== undefined) {
        stocktaking.transactions.push(updatedStocktaking.transactions[0])
      }

      await stocktaking.save();
      return res.json({msg: 'Stock edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteStocktaking = async (req: Request, res: Response) => {
    const { stocktaking } = req;
    try {
      await stocktaking.deleteOne();
      return res.json({msg: 'Stock successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

}