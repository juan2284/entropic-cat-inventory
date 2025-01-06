import { Request, Response } from 'express';
import Charge, { ICharge } from '../models/Charge.js';
import Stocktaking from '../models/Stocktaking.js';
import Transaction from '../models/Transaction.js';

export class ChargeController {

  static getCharges = async (req: Request, res: Response) => {
    try {
      const charges: ICharge[] = await Charge.find().populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'product.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');

      if (charges.length === 0) {
        const error = new Error('There are no registered charges yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(charges);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getChargeById = (req: Request, res: Response) => {
    const { charge } = req;
    try {
      return res.json(charge);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewCharge = async (req: Request, res: Response) => {
    const { supplier, product, quantity, total_amount, amount_one, amount_two, amount_three, currency_rate, price_one, price_two } = req.body;

    const pending_amount = Number(total_amount) - (Number(amount_one) + Number(amount_three) + (Number(amount_two) * Number(currency_rate)));
    const status = pending_amount > 0 ? 'pending' : 'paid';

    const newCharge = {
      total_amount: Number(total_amount),
      supplier: supplier,
      product: {
        id: product,
        quantity: Number(quantity)
      },
      amount_one: Number(amount_one),
      amount_two: Number(amount_two),
      amount_three: Number(amount_three),
      currency_rate: currency_rate,
      status: status,
      pending_amount: pending_amount
    };
    const charge = new Charge(newCharge);

    const newStock = {
      product: product,
      price_one: price_one,
      price_two: price_two,
      quantity: quantity,
      remaining: quantity,
      supplier: supplier,
      charge: charge._id,
      transactions: []
    };
    const stock = new Stocktaking(newStock);

    const newTransaction = {
      type: 'creation',
      total_amount: total_amount,
      amount_one: amount_one,
      amount_two: amount_two,
      amount_three: amount_three,
      pending_amount: pending_amount,
      currency_rate: currency_rate,
      charge: charge._id,
      date: new Date()
    };
    const transaction = new Transaction(newTransaction);

    try {
      await Promise.allSettled([charge.save(), stock.save(), transaction.save()]);
      return res.json({msg: 'Charge registered successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editCharge = async (req: Request, res: Response) => {
    const charge: ICharge = req.charge;
    const updatedCharge = req.body;

    try {
      const newTransaction = {
        type: 'edit',
        total_amount: charge.total_amount,
        amount_one: updatedCharge.amount_one !== '' ? Number(updatedCharge.amount_one) : 0,
        amount_two: updatedCharge.amount_two !== '' && updatedCharge.currency_rate !== '' ? Number(updatedCharge.amount_two) : 0,
        amount_three: updatedCharge.amount_three !== '' ? Number(updatedCharge.amount_three) : 0,
        pending_amount: charge.pending_amount - (
          (updatedCharge.amount_one !== '' ? Number(updatedCharge.amount_one) : 0) +
          (updatedCharge.amount_three !== '' ? Number(updatedCharge.amount_three) : 0) +
          (
            (updatedCharge.amount_two !== '' ? Number(updatedCharge.amount_two) : 0) *
            (updatedCharge.currency_rate !== '' ? Number(updatedCharge.currency_rate) : 0)
          )
        ),
        currency_rate: updatedCharge.currency_rate !== '' && updatedCharge.amount_two !== '' ? Number(updatedCharge.currency_rate) : 0,
        charge: charge._id,
        date: new Date()
      };
      const transaction = new Transaction(newTransaction);

      charge.product.quantity = updatedCharge.quantity !== undefined ? updatedCharge.quantity : charge.product.quantity;
      charge.total_amount = updatedCharge.total_amount !== undefined ? updatedCharge.total_amount : charge.total_amount;
      charge.amount_one = updatedCharge.amount_one !== undefined ? Number(updatedCharge.amount_one) + Number(charge.amount_one) : Number(charge.amount_one);
      charge.amount_two = updatedCharge.amount_two !== undefined && updatedCharge.amount_two !== '' && updatedCharge.currency_rate !== undefined && updatedCharge.currency_rate !== '' ? Number(updatedCharge.amount_two) + Number(charge.amount_two) : Number(charge.amount_two);
      charge.amount_three = updatedCharge.amount_three !== undefined ? Number(updatedCharge.amount_three) + Number(charge.amount_three) : Number(charge.amount_three);
      charge.currency_rate = charge.currency_rate = updatedCharge.currency_rate !== undefined && updatedCharge.currency_rate !== '' && updatedCharge.amount_two !== undefined && updatedCharge.amount_two !== '' ? Number(updatedCharge.currency_rate) : Number(charge.currency_rate);
      charge.pending_amount = Number(updatedCharge.total_amount) - (Number(updatedCharge.amount_one) + Number(updatedCharge.amount_three) + (Number(updatedCharge.amount_two) * Number(updatedCharge.currency_rate)));
      charge.status = charge.pending_amount === 0 ? 'paid' : 'pending';

      if (updatedCharge.quantity !== charge.product.quantity) {
        const stock = await Stocktaking.find().where('charge').equals(charge._id);
        const sales = stock[0].quantity - stock[0].remaining;
        stock[0].remaining = updatedCharge.quantity - sales;
        stock[0].quantity = updatedCharge.quantity;

        stock[0].save();
      }
      
      await Promise.allSettled([charge.save(), transaction.save()]);
      return res.json({msg: 'Charge edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static amortizeCharge = async (req: Request, res: Response) => {
    const charge: ICharge = req.charge;
    const updatedCharge = req.body;
    let newTransaction = {
      type: '',
      total_amount: charge.total_amount,
      amount_one: updatedCharge.amount_one !== '' ? Number(updatedCharge.amount_one) : 0,
      amount_two: updatedCharge.amount_two !== '' && updatedCharge.currency_rate !== '' ? Number(updatedCharge.amount_two) : 0,
      amount_three: updatedCharge.amount_three !== '' ? Number(updatedCharge.amount_three) : 0,
      pending_amount: charge.pending_amount - (
        (updatedCharge.amount_one !== '' ? Number(updatedCharge.amount_one) : 0) +
        (updatedCharge.amount_three !== '' ? Number(updatedCharge.amount_three) : 0) +
        (
          (updatedCharge.amount_two !== '' ? Number(updatedCharge.amount_two) : 0) *
          (updatedCharge.currency_rate !== '' ? Number(updatedCharge.currency_rate) : 0)
        )
      ),
      currency_rate: updatedCharge.currency_rate !== '' && updatedCharge.amount_two !== '' ? Number(updatedCharge.currency_rate) : 0,
      charge: charge._id,
      date: new Date()
    };

    try {
      if (newTransaction.pending_amount === 0) {
        newTransaction.type = 'total';
      } else {
        newTransaction.type = 'partial';
      }
      const transaction = new Transaction(newTransaction);
      
      charge.pending_amount =
        Number(charge.pending_amount) -
        (
          Number(updatedCharge.amount_one !== undefined ? Number(updatedCharge.amount_one) : 0) +
          Number(updatedCharge.amount_three !== undefined ? Number(updatedCharge.amount_three) : 0) +
          (
            (
              Number(updatedCharge.amount_two !== undefined ? Number(updatedCharge.amount_two) : 0) *
              Number(updatedCharge.currency_rate !== undefined ? Number(updatedCharge.currency_rate) : 0)
            )
          )
        )
      ;
      
      charge.amount_one = updatedCharge.amount_one !== undefined ? Number(updatedCharge.amount_one) + Number(charge.amount_one) : Number(charge.amount_one);
      charge.amount_two = updatedCharge.amount_two !== undefined && updatedCharge.amount_two !== '' && updatedCharge.currency_rate !== undefined && updatedCharge.currency_rate !== '' ? Number(updatedCharge.amount_two) + Number(charge.amount_two) : Number(charge.amount_two);
      charge.amount_three = updatedCharge.amount_three !== undefined ? Number(updatedCharge.amount_three) + Number(charge.amount_three) : Number(charge.amount_three);
      charge.currency_rate = updatedCharge.currency_rate !== undefined && updatedCharge.currency_rate !== '' && updatedCharge.amount_two !== undefined && updatedCharge.amount_two !== '' ? Number(updatedCharge.currency_rate) : Number(charge.currency_rate);
      charge.status = charge.pending_amount === 0 ? 'paid' : 'pending';
      
      await Promise.allSettled([charge.save(), transaction.save()]);
      return res.json({msg: 'Charge edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteCharge = async (req: Request, res: Response) => {
    const { charge } = req;
    try {
      const stock = await Stocktaking.findOne().where('charge').equals(charge._id);

      if (stock.stock_out === true || stock.remaining < stock.quantity) {
        const error = new Error('Related stock is in use and cannot be deleted');
        return res.status(404).json({ error: error.message });
      }

      const newTransaction = {
        type: 'delete',
        total_amount: charge.total_amount,
        amount_one: charge.amount_one,
        amount_two: charge.amount_two,
        amount_three: charge.amount_three,
        pending_amount: charge.pending_amount,
        currency_rate: charge.currency_rate,
        charge: charge._id,
        date: new Date()
      };
      const transaction = new Transaction(newTransaction);

      await Promise.allSettled([charge.save(), stock.save(), transaction.save()]);
      return res.json({msg: 'Charge successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getChargesBySupplier = async (req: Request, res: Response) => {
    const { supplierId } = req.params;
    try {
      const supplierCharges: ICharge[] = await Charge.find().where('supplier').equals(supplierId).populate({path: 'supplier', model: 'Supplier', select: '-__v -createdAt -updatedAt'}).populate({path: 'product.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');
      return res.json(supplierCharges);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

}