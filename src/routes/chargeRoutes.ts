import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.js";
import chargeExists from "../middlewares/chargeExist.js";
import { ChargeController } from "../controllers/ChargeController.js";

const router = Router();
router.param('chargeId', chargeExists);

router.get('/', ChargeController.getCharges);

router.get('/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.getChargeById
);

router.get('/get-charges/:supplierId',
  param('supplierId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.getChargesBySupplier
);

router.post('/add-charge',
  body('total_amount').notEmpty().withMessage('Total amount is required').isNumeric().withMessage('The amount must be numerical'),
  body('supplier').notEmpty().withMessage('Supplier is required').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.addNewCharge
);

router.patch('/edit-charge/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.editCharge
);

router.patch('/amortize-charge/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.amortizeCharge
);

router.delete('/delete-charge/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ChargeController.deleteCharge
);

export default router;