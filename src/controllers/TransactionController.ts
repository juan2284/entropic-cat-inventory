import { Request, Response } from 'express';
import Transaction, { ITransaction } from "@/models/Transaction.js";
import Payment from '@/models/Payment.js';
import Charge from '@/models/Charge.js';

export class TransactionController {

  static getTransactions = async (req: Request, res: Response) => {
    try {
      const transactions = await Transaction.find()
        .populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'})
        .populate({path: 'charge', model: 'Charge', select: '-__v -createdAt -updatedAt'})
        .select('-__v -createdAt -updatedAt');

      if (transactions.length === 0) {
        const error = new Error('There are no registered transactions yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(transactions);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getTransactionsByCharge = async (req: Request, res: Response) => {
    const { chargeId } = req.params;
    try {
      const transactions = await Transaction.find().where('charge').equals(chargeId).select('-__v -createdAt -updatedAt');

      return res.json(transactions);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getTransactionsByPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    try {
      const transactions = await Transaction.find().where('payment').equals(paymentId).select('-__v -createdAt -updatedAt');

      return res.json(transactions);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getTransactionById = (req: Request, res: Response) => {
    const { transaction } = req;
    try {
      return res.json(transaction);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewTransaction = async (req: Request, res: Response) => {
    const transaction = new Transaction(req.body);
    try {
      await transaction.save();
      return res.json({msg: 'Transaction registered successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editTransaction = async (req: Request, res: Response) => {
    const transaction: ITransaction = req.transaction;
    const updatedTransaction: ITransaction = req.body;
    const transactionOrigin = transaction.payment !== null ? 'payment' : transaction.charge !== null ? 'charge' : 'N/A';

    try {
      if (transactionOrigin === 'payment') {
        const payment = await Payment.findById(transaction.payment);
        
        payment.total_amount = updatedTransaction.total_amount === 0 || updatedTransaction.total_amount === payment.total_amount  ? payment.total_amount : updatedTransaction.total_amount;
        payment.amount_one = transaction.amount_one !== updatedTransaction.amount_one ? (payment.amount_one - transaction.amount_one) + updatedTransaction.amount_one : payment.amount_one;
        payment.amount_two = transaction.amount_two !== updatedTransaction.amount_two ? (payment.amount_two - transaction.amount_two) + updatedTransaction.amount_two : payment.amount_two;
        payment.amount_three = transaction.amount_three !== updatedTransaction.amount_three ? (payment.amount_three - transaction.amount_three) + updatedTransaction.amount_three : payment.amount_three;
        payment.pending_amount = transaction.amount_one !== updatedTransaction.amount_one ? payment.pending_amount + transaction.amount_one : payment.pending_amount;
        payment.pending_amount = transaction.amount_three !== updatedTransaction.amount_three ? payment.pending_amount + transaction.amount_three : payment.pending_amount;
        payment.pending_amount = transaction.amount_two !== updatedTransaction.amount_two ? (transaction.amount_two * transaction.currency_rate) + payment.pending_amount : payment.pending_amount;

        payment.pending_amount = Number((payment.total_amount - (payment.amount_one + payment.amount_three + (payment.amount_two * updatedTransaction.currency_rate))).toFixed(2));
        
        payment.status = payment.pending_amount === 0 ? 'paid' : 'pending';
        transaction.type = 'edit';

        const newTransaction = {
          type: payment.pending_amount === 0 ? 'total' : 'partial',
          total_amount: updatedTransaction.total_amount,
          amount_one: updatedTransaction.amount_one,
          amount_two: updatedTransaction.amount_two,
          amount_three: updatedTransaction.amount_three,
          pending_amount: payment.pending_amount,
          currency_rate: updatedTransaction.currency_rate,
          payment: payment._id,
          date: new Date()
        };
        const editTransaction = new Transaction(newTransaction);
        await Promise.allSettled([payment.save(), transaction.save(), editTransaction.save()]);
        
      } else if (transactionOrigin === 'charge') {
        const charge = await Charge.findById(transaction.charge);
        
        charge.total_amount = updatedTransaction.total_amount === 0 || updatedTransaction.total_amount === charge.total_amount ? charge.total_amount : updatedTransaction.total_amount;

        charge.amount_one = transaction.amount_one !== updatedTransaction.amount_one ? (charge.amount_one - transaction.amount_one) + updatedTransaction.amount_one : charge.amount_one;

        charge.amount_two = transaction.amount_two !== updatedTransaction.amount_two ? (charge.amount_two - transaction.amount_two) + updatedTransaction.amount_two : charge.amount_two;

        charge.amount_three = transaction.amount_three !== updatedTransaction.amount_three ? (charge.amount_three - transaction.amount_three) + updatedTransaction.amount_three : charge.amount_three;

        charge.pending_amount = transaction.amount_one !== updatedTransaction.amount_one ? charge.pending_amount + transaction.amount_one : charge.pending_amount;
        charge.pending_amount = transaction.amount_three !== updatedTransaction.amount_three ? charge.pending_amount + transaction.amount_three : charge.pending_amount;
        charge.pending_amount = transaction.amount_two !== updatedTransaction.amount_two ? (transaction.amount_two * transaction.currency_rate) + charge.pending_amount : charge.pending_amount;

        charge.pending_amount = Number((charge.total_amount - (charge.amount_one + charge.amount_three + (charge.amount_two * updatedTransaction.currency_rate))).toFixed(2));

        charge.status = charge.pending_amount === 0 ? 'paid' : 'pending';
        transaction.type = 'edit';

        const newTransaction = {
          type: charge.pending_amount === 0 ? 'total' : 'partial',
          total_amount: updatedTransaction.total_amount,
          amount_one: updatedTransaction.amount_one,
          amount_two: updatedTransaction.amount_two,
          amount_three: updatedTransaction.amount_three,
          pending_amount: charge.pending_amount,
          currency_rate: updatedTransaction.currency_rate,
          charge: charge._id,
          date: new Date()
        };
        const editTransaction = new Transaction(newTransaction);
        await Promise.allSettled([charge.save(), transaction.save(), editTransaction.save()]);
      }

      return res.json({msg: 'Transaction edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteTransaction = async (req: Request, res: Response) => {
    const { transaction } = req;
    try {
      await transaction.deleteOne();
      return res.json({msg: 'Transaction successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }
}