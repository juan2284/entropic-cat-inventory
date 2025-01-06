import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  code: string;
  name: string;
};

const CategorySchema: Schema = new Schema({
  code: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  }
}, {timestamps: true});

const Category = mongoose.model<ICategory>('Category', CategorySchema);
export default Category;