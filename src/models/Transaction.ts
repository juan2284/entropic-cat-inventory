import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { IPayment } from "../models/Payment.js";
import { ICharge } from "../models/Charge.js";

const transactionType = {
  CREATION: 'creation',
  DELETE: 'delete',
  EDIT: 'edit',
  PARTIAL_PAY: 'partial',
  TOTAL_PAY: 'total'
} as const;

export type TransactionType = typeof transactionType[keyof typeof transactionType];

export interface ITransaction extends Document {
  type: TransactionType;
  total_amount: number;
  pending_amount: number;
  amount_one: number;
  amount_two: number;
  amount_three: number;
  currency_rate: number;
  receiver: string;
  payment: PopulatedDoc<IPayment & Document>;
  charge: PopulatedDoc<ICharge & Document>;
  date: Date;
};

const TransactionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: Object.values(transactionType),
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
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
  pending_amount: {
    type: Number,
    default: 0
  },
  currency_rate: {
    type: Number,
    default: 0
  },
  receiver: {
    type: String,
    trim: true,
    default: 'seller'
  },
  payment: {
    type: Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  charge: {
    type: Types.ObjectId,
    ref: 'Charge',
    default: null
  },
  date: {
    type: Date,
    required: true,
    default: Date.now()
  }
}, {timestamps: true});

const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;