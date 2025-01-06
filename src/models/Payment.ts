import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ICustomer } from "../models/Customer.js";
import { IStocktaking } from "../models/Stocktaking.js";

const paymentStatus = {
  PENDING: 'pending',
  PAID: 'paid'
} as const;

type ProductsList = {
  id: PopulatedDoc<IStocktaking & Document>;
  quantity: number;
  unitPrice: number;
};

export type PaymentStatus = typeof paymentStatus[keyof typeof paymentStatus];

export interface IPayment extends Document {
  total_amount: number;
  customer: PopulatedDoc<ICustomer & Document>;
  products: ProductsList[];
  amount_one: number;
  amount_two: number;
  amount_three: number;
  currency_rate: number;
  settlement_date: Date;
  status: PaymentStatus;
  pending_amount: number;
};

const PaymentSchema: Schema = new Schema({
  total_amount: {
    type: Number,
    required: true
  },
  customer: {
    type: Types.ObjectId,
    ref: 'Customer'
  },
  products: [
    {
      id: {
        type: Types.ObjectId,
        ref: 'Stocktaking'
      },
      quantity: {
        type: Number,
        required: true
      },
      unitPrice: {
        type: Number,
        required: true
      }
    }    
  ],
  amount_one: {
    type: Number,
    default: 0
  },
  amount_two: {
    type: Number,
    default: 0
  },
  amount_three: {
    type: Number,
    default: 0
  },
  currency_rate: {
    type: Number,
    default: 0
  },
  settlement_date: {
    type: Date,
    default: Date.now()
  },
  pending_amount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(paymentStatus),
    default: paymentStatus.PENDING
  }
}, {timestamps: true});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;