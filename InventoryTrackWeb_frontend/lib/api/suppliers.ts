import { suppliersAPI } from './endpoints';

export const supplierApi = {
	create: (data: any) => suppliersAPI.create(data),
	getAll: () => suppliersAPI.getAll(),
	getById: (id: string) => suppliersAPI.getById(id),
	update: (id: string, data: any) => suppliersAPI.update(id, data),
	delete: (id: string) => suppliersAPI.delete(id),
	getByProduct: (product: string) => suppliersAPI.getByProduct(product),
};
