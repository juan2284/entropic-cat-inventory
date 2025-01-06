import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ISupplier } from "@/models/Supplier.js";
import { IProduct } from "@/models/Product.js";
import { ICharge } from "@/models/Charge.js";
import { IPayment } from "@/models/Payment.js";

export interface IStocktaking extends Document {
  product: PopulatedDoc<IProduct & Document>;
  price_one: number;
  price_two: number;
  quantity: number;
  supplier: PopulatedDoc<ISupplier & Document>;
  charge: PopulatedDoc<ICharge & Document>;
  remaining: number;
  stock_out: boolean;
  transactions: {payment: PopulatedDoc<IPayment & Document>, quantity: number}[];
};

const StocktakingSchema: Schema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: 'Product'
  },
  price_one: {
    type: Number,
    required: true
  },
  price_two: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  supplier: {
    type: Types.ObjectId,
    ref: 'Supplier'
  },
  charge: {
    type: Types.ObjectId,
    ref: 'Charge'
  },
  remaining: {
    type: Number,
    default: 0
  },
  stock_out: {
    type: Boolean,
    default: false
  },
  transactions: [
    {
      payment: {
        type: Types.ObjectId,
        ref: 'Payment'
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
}, {timestamps: true});

const Stocktaking = mongoose.model<IStocktaking>('Stocktaking', StocktakingSchema);
export default Stocktaking;