
import { IngredientsRepository } from "../../routes/repositories/ingredients/ingredients.repository";
import { IRecipe } from "../../models/ingredients/ingredients.models";

let ingredientsRepository = new IngredientsRepository();
export class IngredientsService{
    async createIngredient(data: Partial<IRecipe>){
        const newIngredient = await ingredientsRepository.createIngredient(data);
        return newIngredient;
    }
    async getIngredientById(id: string){
        const ingredient = await ingredientsRepository.getIngredientById(id);
        if(!ingredient){
            throw new Error("Ingredient not found");
        }
        return ingredient;
    }
    async getAllIngredients(page: number, limit: number){
        const { ingredients, total } = await ingredientsRepository.getAllIngredients(page, limit);
        return { ingredients, total };
    }
    async updateIngredientById(id: string, data: Partial<IRecipe>){
        const ingredient = await ingredientsRepository.getIngredientById(id);
        if(!ingredient){
            throw new Error("Ingredient not found");
        }
        const updatedIngredient = await ingredientsRepository.updateIngredientById(id, data);
        return updatedIngredient;
    }

    async deleteIngredientById(id: string){
        const deleted = await ingredientsRepository.deleteIngredientById(id);
        if(!deleted){
            throw new Error("Ingredient not found");
        }
        return true;
    }   
}
export default IngredientsService;

