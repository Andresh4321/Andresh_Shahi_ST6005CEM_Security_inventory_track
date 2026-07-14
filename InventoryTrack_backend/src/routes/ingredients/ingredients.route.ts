import { Router } from "express";
import recipeController from "../../controllers/ingredients/recipe.controller";
import { authorizedMiddelWare } from "../../middleware/authorized.middleware";

const router = Router();

router.use(authorizedMiddelWare);

router.post("/", recipeController.create);
router.get("/", recipeController.getAll);
router.get("/:id", recipeController.getById);
router.put("/:id", recipeController.update);
router.delete("/:id", recipeController.delete);

export default router;
