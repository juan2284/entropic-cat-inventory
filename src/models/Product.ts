import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";

const productCategories = {
  OILS: 'oils',
  BATTERIES: 'batteries',
  PARTS: 'parts',
  ACCESSORIES: 'accessories',
  OTHERS: 'others'
} as const;

export type ProductCategories = typeof productCategories[keyof typeof productCategories];

export interface IProduct extends Document {
  code: string;
  name: string;
  brand: string;
  type: string;
  description: string;
  category: ProductCategories;
  image: string;
};

const ProductSchema: Schema = new Schema({
  code: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  brand: {
    type: String,
    trim: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(productCategories)
  },
  image: {
    type: String,
    trim: true,
    required: true
  }
}, {timestamps: true});

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;