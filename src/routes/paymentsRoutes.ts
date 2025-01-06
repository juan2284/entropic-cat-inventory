import { Router } from "express";
import { body, param } from "express-validator";
import paymentExists from "@/middlewares/paymentExist.js";
import { handleInputErrors } from "@/middlewares/validation.js";
import { PaymentController } from "@/controllers/PaymentController.js";

const router = Router();
router.param('paymentId', paymentExists);

router.get('/', PaymentController.getPayments);

router.get('/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  PaymentController.getPaymentById
);

router.get('/get-payments/:customerId',
  param('customerId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  PaymentController.getPaymentsByCustomer
);

router.post('/add-payment', 
  body('total_amount').notEmpty().withMessage('Total amount is required').isNumeric().withMessage('The amount must be numerical'),
  body('customer').notEmpty().withMessage('Customer is required').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
 PaymentController.addNewPayment
);

router.patch('/edit-payment/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  PaymentController.editPayment
);

router.patch('/amortize-payment/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  PaymentController.amortizePayment
);

router.delete('/delete-payment/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  PaymentController.deletePayment
);

export default router;