import { Request, Response } from 'express';
import Payment, { IPayment } from '@/models/Payment.js';
import Transaction from '@/models/Transaction.js';
import Stocktaking from '@/models/Stocktaking.js';

export class PaymentController {

  static getPayments = async (req: Request, res: Response) => {
    try {
      const payments: IPayment[] = await Payment.find().populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'products.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');
      
      if (payments.length === 0) {
        const error = new Error('There are no registered payments yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(payments);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getPaymentById = async (req: Request, res: Response) => {
    const { payment } = req;
    try {
      return res.json(payment);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getPaymentsByCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    try {
      const customerPayments: IPayment[] = await Payment.find().where('customer').equals(customerId).populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'products.id', model: 'Product', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');
      return res.json(customerPayments);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewPayment = async (req: Request, res: Response) => {
    const payment = new Payment(req.body);
    try {
      payment.products.map(async product => {
        const stocksProduct = await Stocktaking.find().where('product').equals(product.id).where('stock_out').equals(true).where('remaining').gte(0);

        let quantitySelected = product.quantity;
        stocksProduct.map(stock => {
          if (quantitySelected > 0) {
            if (quantitySelected > stock.remaining) {
              const newTransactionStock = {
                payment: payment._id,
                quantity: stock.remaining
              };
              const stockTransactions = [];
              stock.transactions.map(transaction => {
                stockTransactions.push(transaction);
              });
              stockTransactions.push(newTransactionStock);
              stock.transactions = stockTransactions;
              
              stock.stock_out = false;
              quantitySelected = quantitySelected - stock.remaining;
              stock.remaining = 0;
              stock.save();

            } else if (quantitySelected <= stock.remaining) {
              const newTransactionStock = {
                payment: payment._id,
                quantity: quantitySelected
              };

              stock.remaining = stock.remaining - quantitySelected;
              const stockTransactions = [];
              stock.transactions.map(transaction => {
                stockTransactions.push(transaction);
              });
              stockTransactions.push(newTransactionStock);
              stock.transactions = stockTransactions;

              if (stock.remaining === 0) {
                stock.stock_out = false;              
              }

              quantitySelected = 0;
              stock.save();
            }
          }
        });
      });
    
      const newTransaction = {
        type: 'creation',
        total_amount: payment.total_amount,
        amount_one: payment.amount_one,
        amount_two: payment.amount_two,
        amount_three: payment.amount_three,
        pending_amount: payment.pending_amount,
        currency_rate: payment.currency_rate,
        payment: payment._id,
        date: new Date()
      };

      const transaction = new Transaction(newTransaction);
      await Promise.allSettled([payment.save(), transaction.save()]);
      return res.json({msg: 'Payment registered successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editPayment = async (req: Request, res: Response) => {
    const payment: IPayment = req.payment;
    const updatedPayment: IPayment = req.body;

    try {
      payment.total_amount = updatedPayment.total_amount !== undefined ? updatedPayment.total_amount : payment.total_amount;
      payment.customer = updatedPayment.customer !== undefined ? updatedPayment.customer : payment.customer;
      payment.products = updatedPayment.products !== undefined ? updatedPayment.products : payment.products;
      payment.amount_one = updatedPayment.amount_one !== undefined ? updatedPayment.amount_one : payment.amount_one;
      payment.amount_two = updatedPayment.amount_two !== undefined ? updatedPayment.amount_two : payment.amount_two;
      payment.amount_three = updatedPayment.amount_three !== undefined ? updatedPayment.amount_three : payment.amount_three;
      payment.currency_rate = updatedPayment.currency_rate !== undefined ? updatedPayment.currency_rate : payment.currency_rate;
      payment.settlement_date = updatedPayment.settlement_date !== undefined ? updatedPayment.settlement_date : payment.settlement_date;
      payment.status = updatedPayment.status !== undefined ? updatedPayment.status : payment.status;
      payment.pending_amount = updatedPayment.pending_amount !== undefined ? updatedPayment.pending_amount : payment.pending_amount;

      await payment.save();
      return res.json({msg: 'Payment edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deletePayment = async (req: Request, res: Response) => {
    const { payment } = req;
    const stocks = await Stocktaking.find();
    stocks.map(stock => {
      const stockToModify = stock.transactions.filter(transaction => transaction.payment.toString() === payment._id.toString());
      if (stockToModify.length !== 0) {
        const originalTransactions = stock.transactions.filter(transaction => transaction.payment.toString() !== payment._id.toString());
        stock.transactions = originalTransactions;
        stock.remaining += stockToModify[0].quantity;
        stock.stock_out = stock.remaining === 0 ? false : true;

        stock.save();
      }      
    });

    const newTransaction = {
      type: 'delete',
      total_amount: payment.total_amount,
      amount_one: payment.amount_one,
      amount_two: payment.amount_two,
      amount_three: payment.amount_three,
      pending_amount: payment.pending_amount,
      currency_rate: payment.currency_rate,
      payment: payment._id,
      date: new Date()
    };
    const transaction = new Transaction(newTransaction);

    try {
      await Promise.allSettled([payment.save(), transaction.save()]);
      return res.json({msg: 'Payment successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static amortizePayment = async (req: Request, res: Response) => {
    const payment: IPayment = req.payment;
    const updatedPayment = req.body;
    let newTransaction = {
      type: '',
      total_amount: payment.total_amount,
      amount_one: updatedPayment.amount_one !== '' ? Number(updatedPayment.amount_one) : 0,
      amount_two: updatedPayment.amount_two !== '' && updatedPayment.currency_rate !== '' ? Number(updatedPayment.amount_two) : 0,
      amount_three: updatedPayment.amount_three !== '' ? Number(updatedPayment.amount_three) : 0,
      pending_amount: payment.pending_amount - (
        (updatedPayment.amount_one !== '' ? Number(updatedPayment.amount_one) : 0) +
        (updatedPayment.amount_three !== '' ? Number(updatedPayment.amount_three) : 0) +
        (
          (updatedPayment.amount_two !== '' ? Number(updatedPayment.amount_two) : 0) *
          (updatedPayment.currency_rate !== '' ? Number(updatedPayment.currency_rate) : 0)
        )
      ),
      currency_rate: updatedPayment.currency_rate !== '' && updatedPayment.amount_two !== '' ? Number(updatedPayment.currency_rate) : 0,
      payment: payment._id,
      date: new Date()
    };
  
    try {
      if (newTransaction.pending_amount === 0) {
        newTransaction.type = 'total';
      } else {
        newTransaction.type = 'partial';
      }
      const transaction = new Transaction(newTransaction);
      
      payment.pending_amount =
        Number(payment.pending_amount) -
        (
          Number(updatedPayment.amount_one !== undefined ? Number(updatedPayment.amount_one) : 0) +
          Number(updatedPayment.amount_three !== undefined ? Number(updatedPayment.amount_three) : 0) +
          (
            (
              Number(updatedPayment.amount_two !== undefined ? Number(updatedPayment.amount_two) : 0) *
              Number(updatedPayment.currency_rate !== undefined ? Number(updatedPayment.currency_rate) : 0)
            )
          )
        )
      ;
      
      payment.amount_one = updatedPayment.amount_one !== undefined ? Number(updatedPayment.amount_one) + Number(payment.amount_one) : Number(payment.amount_one);
      payment.amount_two = updatedPayment.amount_two !== undefined && updatedPayment.amount_two !== '' && updatedPayment.currency_rate !== undefined && updatedPayment.currency_rate !== '' ? Number(updatedPayment.amount_two) + Number(payment.amount_two) : Number(payment.amount_two);
      payment.amount_three = updatedPayment.amount_three !== undefined ? Number(updatedPayment.amount_three) + Number(payment.amount_three) : Number(payment.amount_three);
      payment.currency_rate = updatedPayment.currency_rate !== undefined && updatedPayment.currency_rate !== '' && updatedPayment.amount_two !== undefined && updatedPayment.amount_two !== '' ? Number(updatedPayment.currency_rate) : Number(payment.currency_rate);
      payment.status = payment.pending_amount === 0 ? 'paid' : 'pending';

      await Promise.allSettled([payment.save(), transaction.save()]);
      return res.json({msg: 'Payment edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }
}