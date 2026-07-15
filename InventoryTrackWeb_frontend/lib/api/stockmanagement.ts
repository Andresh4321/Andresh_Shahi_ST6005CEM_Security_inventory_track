import { stockAPI } from './endpoints';

export const stockManagementApi = {
	createTransaction: (data: any) => stockAPI.createTransaction(data),
	getTransactions: () => stockAPI.getTransactions(),
	getCurrentStock: () => stockAPI.getCurrentStock(),
	getById: (id: string) => stockAPI.getById(id),
	update: (id: string, data: any) => stockAPI.update(id, data),
	delete: (id: string) => stockAPI.delete(id),
};
