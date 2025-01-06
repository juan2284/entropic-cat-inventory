import mongoose, { Schema, Document } from "mongoose";

const rolesList = {
  ADMIN: 'admin',
  REGULAR: 'regular'
} as const;

export type RolesList = typeof rolesList[keyof typeof rolesList];

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: RolesList;
  confirmed: boolean;
};

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(rolesList),
    default: rolesList.REGULAR
  },
  confirmed: {
    type: Boolean,
    default: false
  },
}, {timestamps: true});

const User = mongoose.model<IUser>('User', userSchema);
export default User;