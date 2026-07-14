import mongoose, { Document, Schema } from "mongoose";
import { MaterialType } from "../../types/material/material.type";
const MaterialSchema = new Schema(
    {
        name: { type: String, required: true },
        unit: { type: String, required: true },
        unit_price: { type: Number, required: true },
        minimum_stock: { type: Number, required: true },
        description: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
)   
export interface IMaterial extends MaterialType, Document {
    _id: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}   
export const MaterialModel = mongoose.model<IMaterial>('Material', MaterialSchema);
