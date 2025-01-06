import { Router } from "express";
import { body, param } from "express-validator";
import supplierExists from "@/middlewares/supplierExist.js";
import { SupplierController } from "@/controllers/SupplierController.js";
import { handleInputErrors } from "@/middlewares/validation.js";

const router = Router();
router.param('supplierId', supplierExists);

router.get('/', SupplierController.getSuppliers);

router.get('/:supplierId',
  param('supplierId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  SupplierController.getSupplierById
);

router.post('/add-supplier', 
  body('identity_number').notEmpty().withMessage('Supplier identification document is required'),
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('last_name').notEmpty().withMessage('The last name is required'),
  body('telephone').notEmpty().withMessage('The telephone number is required'),
  body('email').toLowerCase().notEmpty().withMessage('Email is required').isEmail().withMessage('You must add an email'),
  handleInputErrors,
  SupplierController.addNewSupplier
);

router.put('/edit-supplier/:supplierId',
  param('supplierId').isMongoId().withMessage('Invalid ID'),
  body('identity_number').notEmpty().withMessage('Supplier identification document is required'),
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('last_name').notEmpty().withMessage('The last name is required'),
  body('telephone').notEmpty().withMessage('The telephone number is required'),
  body('email').toLowerCase().notEmpty().withMessage('Email is required').isEmail().withMessage('You must add an email'),
  handleInputErrors,
  SupplierController.editSupplier
);

router.delete('/delete-supplier/:supplierId',
  param('supplierId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  SupplierController.deleteSupplier
);

export default router;