import mongoose, { Document, Schema } from "mongoose";

export interface ISupplier extends Document {
  identity_number: string;
  name: string;
  last_name: string;
  telephone: string;
  email: string;
};

const SupplierSchema: Schema = new Schema({
  identity_number: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  last_name: {
    type: String,
    trim: true,
    required: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  }
}, {timestamps: true});

const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;