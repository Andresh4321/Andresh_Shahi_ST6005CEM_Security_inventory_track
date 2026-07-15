import { dashboardApi } from './dashboard';

export const reportsApi = {
	getSnapshot: async () => {
		const [materials, productions, stockLogs] = await Promise.all([
			dashboardApi.getMaterials(),
			dashboardApi.getProductions(),
			dashboardApi.getStockTransactions(),
		]);

		return { materials, productions, stockLogs };
	},
};
