 import mongoose, { Document, Schema } from "mongoose";
import { SupplierType } from "../../types/supplier/supplier.type";
const supplierSchema: Schema= new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        contact_number: { type: String, required: true },
        products: [{ type: String }],
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: true,
    }
);

supplierSchema.index({ email: 1, user: 1 }, { unique: true });
export interface ISupplier extends SupplierType, Document{
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export const SupplierModel = mongoose.model<ISupplier>('Supplier', supplierSchema);



