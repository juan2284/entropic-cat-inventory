import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { IProduct } from "@/models/Product.js";
import { ISupplier } from "@/models/Supplier.js";

const chargeStatus = {
  PENDING: 'pending',
  PAID: 'paid'
} as const;

type ProductCharged = {
  id: PopulatedDoc<IProduct & Document>;
  quantity: number;
};

export type ChargeStatus = typeof chargeStatus[keyof typeof chargeStatus];

export interface ICharge extends Document {
  total_amount: number;
  supplier: PopulatedDoc<ISupplier & Document>;
  product: ProductCharged;
  amount_one: number;
  amount_two: number;
  amount_three: number;
  currency_rate: number;
  settlement_date: Date;
  status: ChargeStatus;
  pending_amount: number;
};

const ChargeSchema: Schema = new Schema({
  total_amount: {
    type: Number,
    required: true
  },
  supplier: {
    type: Types.ObjectId,
    ref: 'Supplier'
  },
  product: {
    id: {
      type: Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true
    }
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
    enum: Object.values(chargeStatus),
    default: chargeStatus.PENDING
  }
}, {timestamps: true});

const Charge = mongoose.model<ICharge>('Charge', ChargeSchema);
export default Charge;