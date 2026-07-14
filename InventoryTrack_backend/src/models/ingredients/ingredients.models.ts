import mongoose,{Schema} from "mongoose";

const IngredientSchema = new Schema(
    {
        name: { type: String, required: true },
        material:{type:mongoose.Schema.Types.ObjectId, ref:'Material', required:true},

        quantity: { type: Number, required: true },

    },

);
const recipeSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        selling_price: { type: Number, required: true },
        ingredients: [IngredientSchema],
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);
export interface IIngredient extends mongoose.Document {        
    name: string;
    material: mongoose.Types.ObjectId;
    quantity: number;
}
export interface IRecipe extends mongoose.Document {
    name: string;
    description?: string;
    selling_price: number;
    ingredients: IIngredient[];
    user: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}
export const RecipeModel = mongoose.model<IRecipe>('Recipe', recipeSchema);
