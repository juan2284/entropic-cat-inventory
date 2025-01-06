import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { IService } from "../models/Service.js";

const contactResults = {
  PENDING: 'pending',
  CONTACTED: 'contacted',
  NOWHATSAPP: 'nowhatsapp',
  WRONG: 'wrong',
  INCOMPLETE: 'incomplete',
  PREVIOUSLY: 'previously'
} as const;

export type ContactResults = typeof contactResults[keyof typeof contactResults];

export interface IReminder extends Document {
  service: PopulatedDoc<IService & Document>;
  result: ContactResults;
};

export const ReminderSchema: Schema = new Schema({
  service: {
    type: Types.ObjectId,
    ref: 'Service'
  },
  result: {
    type: String,
    enum: Object.values(contactResults),
    default: contactResults.PENDING
  }
}, {timestamps: true});

const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
export default Reminder;