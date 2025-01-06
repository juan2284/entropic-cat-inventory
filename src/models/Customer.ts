import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  identity_number: string;
  name: string;
  last_name: string;
  telephone: string;
  email: string;
};

const CustomerSchema: Schema = new Schema({
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

const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;