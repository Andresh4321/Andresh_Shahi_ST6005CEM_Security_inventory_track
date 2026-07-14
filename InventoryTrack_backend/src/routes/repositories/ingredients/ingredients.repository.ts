import { RecipeModel, IRecipe } from "../../../models/ingredients/ingredients.models";
export interface IIngredientsRepository{
   createIngredient(data: Partial<IRecipe>): Promise<IRecipe>;
   getIngredientById(id: string): Promise<IRecipe | null>;
   getAllIngredients(page: number, limit: number): Promise<{ ingredients: IRecipe[]; total: number }>;
   updateIngredientById(id: string, data: Partial<IRecipe>): Promise<IRecipe | null>;
   deleteIngredientById(id: string): Promise<boolean>;
}
export class IngredientsRepository implements IIngredientsRepository{
    async createIngredient(data: Partial<IRecipe>) {
        const newIngredient = new RecipeModel(data);
        await newIngredient.save();
        return newIngredient;

    }
    async getIngredientById(id: string) {
        const ingredient = await RecipeModel

            .findById(id);
        return ingredient;
    }
    async getAllIngredients(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const ingredients = await RecipeModel.find()

            .skip(skip)
            .limit(limit);
        const total = await RecipeModel.countDocuments();
        return { ingredients, total };
    }
    async updateIngredientById(id: string, data: Partial<IRecipe>) {
        const updatedIngredient = await RecipeModel.findByIdAndUpdate( 
            id, data, { new: true }
            
        );
        return updatedIngredient;
    }
    async deleteIngredientById(id: string) {
        const result = await RecipeModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
export default IngredientsRepository;






// export{ IStock } from "../../models/stock/stock.models";
// import stockTransactionModel from "../../models/stock/stockTransaction.model";
// import { IStockTransaction } from "../../models/stock/stockTransaction.model";

// export interface IStockRepository {
//     createStockTransaction(data: Partial<IStockTransaction>): Promise<IStockTransaction>;
//     getStockTransactionById(id: string): Promise<IStockTransaction | null>;
//     getAllStockTransactions(page: number, limit: number): Promise<{ stockTransactions: IStockTransaction[]; total: number }>;
//     updateStockTransactionById(id: string, data: Partial<IStockTransaction>): Promise<IStockTransaction | null>;
//     deleteStockTransactionById(id: string): Promise<boolean>;
// }

// export class StockRepository implements IStockRepository {
//     async createStockTransaction(data: Partial<IStockTransaction>) {
//         const newStockTransaction = new stockTransactionModel(data);
//         await newStockTransaction.save();
//         return newStockTransaction;
//     }
//     async getStockTransactionById(id: string) {
//         const stockTransaction = await stockTransactionModel.findById(id);
//         return stockTransaction;
//     }
//     async getAllStockTransactions(page: number, limit: number) {
//         const skip = (page - 1) * limit;
//         const stockTransactions = await stockTransactionModel.find()


//             .skip(skip)
//             .limit(limit);
//         const total = await stockTransactionModel.countDocuments();
//         return { stockTransactions, total };
//     }
//     async updateStockTransactionById(id: string, data: Partial<IStockTransaction>) {
//         const updatedStockTransaction = await stockTransactionModel.findByIdAndUpdate(
//             id, data, { new: true }
//         );
//         return updatedStockTransaction;
//     }
//     async deleteStockTransactionById(id: string) {
//         const result = await stockTransactionModel.findByIdAndDelete(id);
//         return result ? true : false;
//     }
// }
// export default StockRepository;

