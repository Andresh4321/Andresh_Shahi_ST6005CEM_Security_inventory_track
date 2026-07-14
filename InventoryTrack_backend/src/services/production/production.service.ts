import { CreateProductionDTO } from "../../dtos/production/production.dto";
import { RecipeModel } from "../../models/ingredients/ingredients.models";
import StockModel from "../../models/stock/stock.models";
import StockTransactionModel from "../../models/stock/stockTransaction.model";
import productionRepository from "../../routes/repositories/production/production.repository";
import Production from "../../models/production/production.models";
import { HttpError } from "../../errors/http_error";

class ProductionService {

  async createProduction(data: CreateProductionDTO & { user: string }) {
    try {
      // 1️⃣ Get the recipe
      const recipe = await RecipeModel.findOne({ _id: data.recipeId, user: data.user })
        .populate("ingredients.material");
      
      if (!recipe) throw new HttpError(404, "Recipe not found");

      const itemsUsed: any[] = [];

      // 2️⃣ Check stock for each ingredient
      for (const ingredient of recipe.ingredients) {
        const stock = await StockModel.findOne({ 
          material: ingredient.material._id,
          user: data.user 
        });
        
        if (!stock) {
          throw new HttpError(400, `Stock not found for ${(ingredient.material as any).name}`);
        }

        const requiredQuantity = ingredient.quantity * data.batchQuantity;

        if (stock.quantity < requiredQuantity) {
          throw new HttpError(
            400,
            `Insufficient material: ${(ingredient.material as any).name}. Required ${requiredQuantity}, available ${stock.quantity}`
          );
        }

        // 3️⃣ Decrease stock
        stock.quantity -= requiredQuantity;
        await stock.save();

        // 4️⃣ Create stock transaction
        await StockTransactionModel.create({
          material: ingredient.material._id,
          transaction_type: "out",
          quantity: requiredQuantity,
          description: `Production: ${recipe.name} (Batch ${data.batchQuantity})`,
          user: data.user
        });

        itemsUsed.push({
          material: ingredient.material._id,
          quantityUsed: requiredQuantity,
          unit: (ingredient.material as any).unit,
        });
      }

      // 5️⃣ Save production record
      const production = await Production.create({
        recipe: recipe._id,
        batchQuantity: data.batchQuantity,
        estimatedOutput: data.estimatedOutput,
        actualOutput: data.actualOutput,
        wastage: 0,
        itemsUsed,
        status: data.actualOutput ? 'completed' : 'ongoing',
        user: data.user
      });

      return await production.populate(['recipe', 'itemsUsed.material']);
    } catch (error: any) {
      throw new HttpError(error.statusCode || 500, error.message || "Failed to create production");
    }
  }

  async getAllProductions(userId: string) {
    try {
      return await Production.find({ user: userId })
        .populate('recipe')
        .populate('itemsUsed.material')
        .sort({ created_at: -1 });
    } catch (error: any) {
      throw new HttpError(500, error.message || "Failed to fetch productions");
    }
  }

  async getProductionById(id: string, userId: string) {
    try {
      const production = await Production.findOne({ _id: id, user: userId })
        .populate('recipe')
        .populate('itemsUsed.material');
      
      if (!production) {
        throw new HttpError(404, "Production not found");
      }
      return production;
    } catch (error: any) {
      throw new HttpError(error.statusCode || 500, error.message || "Failed to fetch production");
    }
  }
  
  async completeProduction(id: string, userId: string, actualOutput: number) {
    try {
      const production = await Production.findOne({ _id: id, user: userId });
      
      if (!production) {
        throw new HttpError(404, "Production not found");
      }
      
      if (production.status === 'completed') {
        throw new HttpError(400, "Production already completed");
      }
      
      production.actualOutput = actualOutput;
      production.wastage = production.estimatedOutput - actualOutput;
      production.status = 'completed';
      await production.save();
      
      return await production.populate(['recipe', 'itemsUsed.material']);
    } catch (error: any) {
      throw new HttpError(error.statusCode || 500, error.message || "Failed to complete production");
    }
  }

  async deleteProduction(id: string, userId: string) {
    try {
      const production = await Production.findOne({ _id: id, user: userId });
      
      if (!production) {
        throw new HttpError(404, "Production not found");
      }

      // If production was started (ongoing), reverse the stock transactions
      if (production.status === 'ongoing') {
        // Reverse the stock reductions by creating return transactions
        const recipe = await RecipeModel.findById(production.recipe).populate('ingredients.material');
        
        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const stock = await StockModel.findOne({ 
              material: ingredient.material._id,
              user: userId 
            });
            
            if (stock) {
              // Return the quantity to stock
              const quantityToReturn = (ingredient.quantity as any) * production.batchQuantity;
              stock.quantity += quantityToReturn;
              await stock.save();

              // Create return transaction
              await StockTransactionModel.create({
                material: ingredient.material._id,
                quantity: quantityToReturn,
                transaction_type: 'in',
                description: `Return from deleted production batch`,
                user: userId
              });
            }
          }
        }
      }

      await Production.findByIdAndDelete(id);
    } catch (error: any) {
      throw new HttpError(error.statusCode || 500, error.message || "Failed to delete production");
    }
  }
}

export default new ProductionService();

