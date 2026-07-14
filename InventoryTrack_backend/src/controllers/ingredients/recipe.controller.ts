import { Request, Response } from "express";
import RecipeService from "../../services/ingredients/recipe.service";

const recipeService = new RecipeService();

export class RecipeController {
    async create(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            const recipe = await recipeService.createRecipe({ ...req.body, user: userId });
            return res.status(201).json({ success: true, data: recipe });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            const recipes = await recipeService.getAllRecipes(userId);
            return res.status(200).json({ success: true, data: recipes });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            const { id } = req.params;
            const recipe = await recipeService.getRecipeById(id, userId);
            
            if (!recipe) {
                return res.status(404).json({ success: false, message: "Recipe not found" });
            }
            
            return res.status(200).json({ success: true, data: recipe });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            const { id } = req.params;
            const updatedRecipe = await recipeService.updateRecipe(id, userId, req.body);
            
            if (!updatedRecipe) {
                return res.status(404).json({ success: false, message: "Recipe not found" });
            }
            
            return res.status(200).json({ success: true, data: updatedRecipe, message: "Recipe updated successfully" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            const { id } = req.params;
            const deleted = await recipeService.deleteRecipe(id, userId);
            
            if (!deleted) {
                return res.status(404).json({ success: false, message: "Recipe not found" });
            }
            
            return res.status(200).json({ success: true, message: "Recipe deleted successfully" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal Server Error" 
            });
        }
    }
}

export default new RecipeController();
