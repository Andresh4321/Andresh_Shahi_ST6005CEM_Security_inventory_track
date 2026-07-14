import { RecipeModel, IRecipe } from "../../models/ingredients/ingredients.models";
import { HttpError } from "../../errors/http_error";

export class RecipeService {
    async createRecipe(data: any): Promise<IRecipe> {
        try {
            const recipe = await RecipeModel.create(data);
            return await recipe.populate('ingredients.material');
        } catch (error: any) {
            throw new HttpError(400, error.message || "Failed to create recipe");
        }
    }

    async getAllRecipes(userId: string): Promise<IRecipe[]> {
        try {
            const recipes = await RecipeModel.find({ user: userId })
                .populate('ingredients.material')
                .sort({ created_at: -1 });
            return recipes;
        } catch (error: any) {
            throw new HttpError(500, error.message || "Failed to fetch recipes");
        }
    }

    async getRecipeById(id: string, userId: string): Promise<IRecipe | null> {
        try {
            const recipe = await RecipeModel.findOne({ _id: id, user: userId })
                .populate('ingredients.material');
            return recipe;
        } catch (error: any) {
            throw new HttpError(500, error.message || "Failed to fetch recipe");
        }
    }

    async updateRecipe(id: string, userId: string, data: any): Promise<IRecipe | null> {
        try {
            const recipe = await RecipeModel.findOneAndUpdate(
                { _id: id, user: userId },
                data,
                { new: true }
            ).populate('ingredients.material');
            return recipe;
        } catch (error: any) {
            throw new HttpError(500, error.message || "Failed to update recipe");
        }
    }

    async deleteRecipe(id: string, userId: string): Promise<boolean> {
        try {
            const result = await RecipeModel.findOneAndDelete({ _id: id, user: userId });
            return !!result;
        } catch (error: any) {
            throw new HttpError(500, error.message || "Failed to delete recipe");
        }
    }
}

export default RecipeService;
