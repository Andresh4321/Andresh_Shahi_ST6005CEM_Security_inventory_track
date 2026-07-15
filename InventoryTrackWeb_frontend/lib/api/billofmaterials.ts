import { billOfMaterialsAPI } from './endpoints';

export const billOfMaterialsApi = {
	getAll: () => billOfMaterialsAPI.getAll(),
	create: (data: any) => billOfMaterialsAPI.create(data),
	changePrice: (id: string, price: number) => billOfMaterialsAPI.changePrice(id, price),
	delete: (id: string) => billOfMaterialsAPI.delete(id),
};
