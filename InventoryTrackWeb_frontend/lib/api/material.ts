import { materialsAPI, stockAPI } from './endpoints';

export interface InventoryMaterial {
	id: string;
	name: string;
	unit: string;
	quantity: number;
	costPerUnit: number;
	minimumStock: number;
}

export const fetchInventoryMaterials = async (): Promise<InventoryMaterial[]> => {
	const [materialsResponse, stockResponse] = await Promise.all([
		materialsAPI.getAll(),
		stockAPI.getCurrentStock(),
	]);

	const backendMaterials = materialsResponse.data?.data || [];
	const stockData = stockResponse.data?.data || [];

	const stockMap = new Map<string, number>();
	stockData.forEach((stock: any) => {
		const materialId = stock.material?._id || stock.material;
		if (materialId) {
			stockMap.set(materialId, stock.quantity || 0);
		}
	});

	return backendMaterials.map((material: any) => ({
		id: material._id,
		name: material.name,
		unit: material.unit,
		quantity: stockMap.get(material._id) || 0,
		costPerUnit: material.unit_price,
		minimumStock: material.minimum_stock,
	}));
};
