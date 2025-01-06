import { Request, Response } from 'express';
import Service, { IService } from '../models/Service.js';
import Reminder, { IReminder } from '../models/Reminder.js';

export class ServiceController {

  static getServices = async (req: Request, res: Response) => {
    try {
      const services = await Service.find().populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).populate({path: 'contact', model: 'Reminder', select: '-__v -updatedAt'}).select('-__v -createdAt -updatedAt');

      if (services.length === 0) {
        const error = new Error('There are no registered services yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(services);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getServicesById = async (req: Request, res: Response) => {
    const { service } = req;
    try {
      return res.json(service);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getServicesByCustomer = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const customerServices: IService[] = await Service.find().where('customer').equals(customerId).populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).populate({path: 'contact', model: 'Reminder', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');
    try {
      return res.json(customerServices);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getServicesByPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const customerServices: IService[] = await Service.find().where('payment').equals(paymentId).populate({path: 'customer', model: 'Customer', select: '-__v -createdAt -updatedAt'}).populate({path: 'payment', model: 'Payment', select: '-__v -createdAt -updatedAt'}).populate({path: 'contact', model: 'Reminder', select: '-__v -createdAt -updatedAt'}).select('-__v -createdAt -updatedAt');
    try {
      return res.json(customerServices);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewService = async (req: Request, res: Response) => {
    const servicePaymentExist = await Service.find().where('payment').equals(req.body.payment);
    if (servicePaymentExist.length !== 0) {
      const error = new Error('A service already exists for this customer');
      return res.status(409).json({error: error.message});
    }

    try {
      const service = new Service(req.body);
      const reminder = new Reminder({
        service: service._id,
        result: 'pending'
      });
      service.contact = reminder._id;
      
      await Promise.allSettled([reminder.save(), service.save()]);
      return res.json({msg: 'Service registered successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editService = async (req: Request, res: Response) => {
    const service: IService = req.service;
    const updatedService: IService = req.body;

    try {
      service.vehicle = updatedService.vehicle !== undefined ? updatedService.vehicle : service.vehicle;
      service.type_oil = updatedService.type_oil !== undefined ? updatedService.type_oil : service.type_oil;
      service.brand_oil = updatedService.brand_oil !== undefined ? updatedService.brand_oil : service.brand_oil;
      service.filter = updatedService.filter !== undefined ? updatedService.filter : service.filter;
      service.mileage = updatedService.mileage !== undefined ? updatedService.mileage : service.mileage;

      await service.save();
      return res.json({msg: 'Service edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteService = async (req: Request, res: Response) => {
    const { service } = req;
    try {
      const reminders = await Reminder.find().where('service').equals(service._id);
      reminders.map(async reminder => {
        await reminder.deleteOne();
      });
      await service.deleteOne();
      return res.json({msg: 'Service successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }
}