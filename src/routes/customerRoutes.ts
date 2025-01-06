import { Router } from "express";
import { body, param } from "express-validator";
import { CustomerController } from "@/controllers/CustomerController.js";
import { handleInputErrors } from "@/middlewares/validation.js";
import customerExists from "@/middlewares/customerExist.js";

const router = Router();
router.param('customerId', customerExists);

router.get('/', CustomerController.getCustomers);

router.get('/:customerId',
  param('customerId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  CustomerController.getCustomerById
);

router.post('/add-customer', 
  body('identity_number').notEmpty().withMessage('Customer identification document is required'),
  body('name').notEmpty().withMessage('Customer name is required'),
  body('last_name').notEmpty().withMessage('The last name is required'),
  body('telephone').notEmpty().withMessage('The telephone number is required'),
  body('email').toLowerCase().notEmpty().withMessage('Email is required').isEmail().withMessage('You must add an email'),
  handleInputErrors,
  CustomerController.addNewCustomer
);

router.put('/edit-customer/:customerId',
  param('customerId').isMongoId().withMessage('Invalid ID'),
  body('identity_number').notEmpty().withMessage('Customer identification document is required'),
  body('name').notEmpty().withMessage('Customer name is required'),
  body('last_name').notEmpty().withMessage('The last name is required'),
  body('telephone').notEmpty().withMessage('The telephone number is required'),
  body('email').toLowerCase().notEmpty().withMessage('Email is required').isEmail().withMessage('You must add an email'),
  handleInputErrors,
  CustomerController.editCustomer
);

router.delete('/delete-customer/:customerId',
  param('customerId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  CustomerController.deleteCustomer
);

export default router;