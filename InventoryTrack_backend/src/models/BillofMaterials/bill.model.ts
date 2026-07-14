

 import mongoose, { Document, Schema } from "mongoose";

const billOfMaterialsSchema = new Schema(
    {
        material: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);
export interface IBillOfMaterials extends Document {
    material: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    user: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}
export default mongoose.model<IBillOfMaterials>('BillOfMaterials', billOfMaterialsSchema);

