import { productionAPI } from './production';
import { stockManagementApi } from './stockmanagement';
import { fetchInventoryMaterials } from './material';

export const dashboardApi = {
	getMaterials: fetchInventoryMaterials,
	getProductions: async () => {
		const response = await productionAPI.getAll();
		return response.data?.data || [];
	},
	getStockTransactions: async () => {
		const response = await stockManagementApi.getTransactions();
		return response.data?.data || [];
	},
};
