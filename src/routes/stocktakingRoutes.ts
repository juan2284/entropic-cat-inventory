import { Router } from "express";
import { body, param } from "express-validator";
import stocktakingExists from "../middlewares/stocktakingExist.js";
import { StocktakingController } from "../controllers/StocktakingController.js";
import { handleInputErrors } from "../middlewares/validation.js";

const router = Router();
router.param('stockId', stocktakingExists);

router.get('/', StocktakingController.getAllStock);

router.get('/:stockId',
  param('stockId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.getStockById
);

router.get('/get-stock/:productId',
  param('productId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.getStockByProduct
);

router.get('/get-by-charge/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.getStockByCharge
);

router.post('/add-stock', 
  body('product').isMongoId().withMessage('Invalid ID'),
  body('price_one').isNumeric().notEmpty().withMessage('You must enter an amount'),
  body('price_two').notEmpty().withMessage('You must enter an amount'),
  body('quantity').isNumeric().notEmpty().withMessage('You must indicate the number of products to register'),
  body('supplier').isMongoId().withMessage('Invalid ID'),
  body('charge').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.addNewStock
);

router.patch('/edit-stock/:stockId',
  param('stockId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.editStocktaking
);

router.delete('/delete-stock/:stockId',
  param('stockId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  StocktakingController.deleteStocktaking
);

export default router;