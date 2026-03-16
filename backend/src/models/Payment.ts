import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

const PaymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'Cash on Delivery' }, // default handling
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String }
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
