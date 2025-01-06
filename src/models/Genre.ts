import mongoose, { Document, Schema } from "mongoose";

export interface IGenre extends Document {
  code: string;
  name: string;
};

const GenreSchema: Schema = new Schema({
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

const Genre = mongoose.model<IGenre>('Genre', GenreSchema);
export default Genre;