import mongoose, { Document, Schema } from "mongoose";

const stockTransactionSchema = new Schema({
    material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    quantity: { type: Number, required: true },
    transaction_type: { type: String, enum: ['in', 'out'], required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export interface IStockTransaction extends Document {
    material: mongoose.Types.ObjectId;
    quantity: number;
    transaction_type: 'in' | 'out';
    description?: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export default mongoose.model<IStockTransaction>('StockTransaction', stockTransactionSchema);