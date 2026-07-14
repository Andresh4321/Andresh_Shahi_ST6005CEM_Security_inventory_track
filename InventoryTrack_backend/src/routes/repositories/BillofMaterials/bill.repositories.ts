import billOfMaterialsModel from "../../../models/BillofMaterials/bill.model";

export interface IBillRepository {
    ChangePrice(id: string, price: number): Promise<void>;
}
export class BillRepository implements IBillRepository {
    async ChangePrice(id: string, price: number) {
        const bill = await billOfMaterialsModel.findById(id);
        if (!bill) {
            throw new Error('Bill of Materials not found');
        }
        bill.price = price;
        await bill.save();
    }
}
export default BillRepository;