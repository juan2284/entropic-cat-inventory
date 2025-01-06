import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ICustomer } from "../models/Customer.js";
import { IPayment } from "../models/Payment.js";
import { IReminder } from "../models/Reminder.js";

export interface IService extends Document {
  customer: PopulatedDoc<ICustomer & Document>;
  payment: PopulatedDoc<IPayment & Document>;
  vehicle: string;
  type_oil: string;
  brand_oil: string;
  filter: string;
  mileage: number;
  service_date: Date;
  contact: PopulatedDoc<IReminder & Document> | unknown;
};

const ServiceSchema: Schema = new Schema({
  customer: {
    type: Types.ObjectId,
    ref: 'Customer'
  },
  payment: {
    type: Types.ObjectId,
    ref: 'Payment'
  },
  vehicle: {
    type: String,
    trim: true,
    required: true,
  },
  type_oil: {
    type: String,
    trim: true,
    required: true,
  },
  brand_oil: {
    type: String,
    trim: true,
    required: true,
  },
  filter: {
    type: String,
    trim: true,
    required: true,
  },
  mileage: {
    type: Number,
    required: true,
    trim: true
  },
  service_date: {
    type: Date,
    default: Date.now()
  },
  contact: {
    type: Types.ObjectId,
    ref: 'Reminder'
  }
}, {timestamps: true});

const Service = mongoose.model<IService>('Service', ServiceSchema);
export default Service;