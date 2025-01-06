import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/Customer.js';

export class CustomerController {

  static getCustomers = async (req: Request, res: Response) => {
    try {
      const customers = await Customer.find().sort('-createdAt').select('-__v -createdAt -updatedAt');

      if (customers.length === 0) {
        const error = new Error('There are no registered clients yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(customers);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getCustomerById = async (req: Request, res: Response) => {
    const { customer } = req;
    try {
      return res.json(customer);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewCustomer = async (req: Request, res: Response) => {
    const customer = new Customer(req.body);
    const customerExist = await Customer.findOne({identity_number: req.body.identity_number});

    if (customerExist) {
      const error = new Error('The customer already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      customer.save();
      return res.json({msg: 'Customer created successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editCustomer = async (req: Request, res: Response) => {
    const customer: ICustomer = req.customer;
    const updatedCustomer: ICustomer = req.body;
    const identityIDExist = await Customer.find().where('identity_number').equals(updatedCustomer.identity_number);

    if (customer.identity_number !== updatedCustomer.identity_number && identityIDExist.length !== 0) {
      const error = new Error('The identification number already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      customer.identity_number = updatedCustomer.identity_number;
      customer.name = updatedCustomer.name;
      customer.last_name = updatedCustomer.last_name;
      customer.telephone = updatedCustomer.telephone;
      customer.email = updatedCustomer.email;

      await customer.save();
      return res.json({msg: 'Customer edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteCustomer = async (req: Request, res: Response) => {
    const { customer } = req;
    try {
      await customer.deleteOne();
      return res.json({msg: 'Client successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }
}