import { Request, Response } from "express";
import { IngredientsService } from "../../services/ingredients/ingredients.service";

let ingredientsService = new IngredientsService();
export class IngredientsController{
    async createIngredient(req: Request, res: Response){
        try{
            const newIngredient = await ingredientsService.createIngredient(req.body);
            return res.status(201).json(
                { success: true, data: newIngredient, message: "Ingredient created successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )

        }

    }
    async getIngredientById(req: Request, res: Response){
        try{
            const ingredient = await ingredientsService.getIngredientById(req.params.id);
            return res.status(200).json(
                { success: true, data: ingredient, message: "Ingredient retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async getAllIngredients(req: Request, res: Response){

        try{
            const page = parseInt(req.query.page as string) || 1;   


            const limit = parseInt(req.query.limit as string) || 10;
            const { ingredients, total } = await ingredientsService.getAllIngredients(page, limit);
            return res.status(200).json(

                { success: true, data: ingredients, total, page, totalPages: Math.ceil(total / limit), message: "Ingredients retrieved successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async updateIngredientById(req: Request, res: Response){
        try{
            const updatedIngredient = await ingredientsService.updateIngredientById(req.params.id, req.body);
            return res.status(200).json(
                { success: true, data: updatedIngredient, message: "Ingredient updated successfully" }
            )
        }
        catch(error: Error | any){
            return res.status(error.statusCode || 500).json(

                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async deleteIngredientById(req: Request, res: Response){
        try{
            await ingredientsService.deleteIngredientById(req.params.id);
            return res.status(200).json(
                { success: true, message: "Ingredient deleted successfully" }
            )
        }
            catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
        }
            
    
    }