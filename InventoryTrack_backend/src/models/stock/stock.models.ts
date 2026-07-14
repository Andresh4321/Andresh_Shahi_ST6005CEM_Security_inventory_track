import mongoose, { Document, Schema } from "mongoose";


const stockSchema= new Schema(
    {
        material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
        quantity: { type: Number, default: 0 },
        description: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: {createdAt: 'created_at', updatedAt: 'updated_at' } }
);

stockSchema.index({ material: 1, user: 1 }, { unique: true });
export interface IStock extends Document {
    material: mongoose.Types.ObjectId;
    quantity: number;
    description?: string;
    user: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}
export default mongoose.model<IStock>('Stock', stockSchema);