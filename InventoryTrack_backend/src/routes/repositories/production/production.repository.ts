import Production from "../../../models/production/production.models";

class ProductionRepository {
  async create(data: any) {
    return Production.create(data);
  }

  async findAll() {
    return Production.find()
      .populate("recipe")
      .populate("itemsUsed.material");
  }

  async findById(id: string) {
    return Production.findById(id)
      .populate("recipe")
      .populate("itemsUsed.material");
  }
}

export default new ProductionRepository();
