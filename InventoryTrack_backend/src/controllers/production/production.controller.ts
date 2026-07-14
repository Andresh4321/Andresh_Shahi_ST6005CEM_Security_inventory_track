import { Request, Response } from "express";
import productionService from "../../services/production/production.service";

class ProductionController {

  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const production = await productionService.createProduction({...req.body, user: userId});
      res.status(201).json({ success: true, data: production });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const productions = await productionService.getAllProductions(userId);
      res.json({ success: true, data: productions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const production = await productionService.getProductionById(req.params.id, userId);
      res.json({ success: true, data: production });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
  
  async complete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { id } = req.params;
      const { actualOutput } = req.body;
      const production = await productionService.completeProduction(id, userId, actualOutput);
      res.json({ success: true, data: production, message: "Production completed successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { id } = req.params;
      await productionService.deleteProduction(id, userId);
      res.json({ success: true, message: "Production deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }}

export default new ProductionController();