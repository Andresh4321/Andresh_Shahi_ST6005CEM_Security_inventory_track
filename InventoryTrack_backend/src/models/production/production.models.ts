import mongoose, { Schema, Document } from "mongoose";

const productionItemSchema = new Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  quantityUsed: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const productionSchema = new Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  batchQuantity: {
    type: Number,
    required: true,
  },
  estimatedOutput: {
    type: Number,
    required: true,
  },
  actualOutput: {
    type: Number,
  },
  wastage: {
    type: Number,
    default: 0,
  },
  itemsUsed: [productionItemSchema],
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export interface IProduction extends Document {
  recipe: mongoose.Types.ObjectId;
  batchQuantity: number;
  estimatedOutput: number;
  actualOutput?: number;
  wastage: number;
  itemsUsed: Array<{
    material: mongoose.Types.ObjectId;
    quantityUsed: number;
    unit: string;
  }>;
  status: 'ongoing' | 'completed';
  user: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export default mongoose.model<IProduction>("Production", productionSchema);
