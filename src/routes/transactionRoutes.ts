import { Router } from "express";
import { body, param } from "express-validator";
import transactionExists from "../middlewares/transactionExist.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { TransactionController } from "../controllers/TransactionController.js";

const router = Router();
router.param('transactionId', transactionExists);

router.get('/', TransactionController.getTransactions);

router.get('/:transactionId',
  param('transactionId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TransactionController.getTransactionById
);

router.get('/get-by-charge/:chargeId',
  param('chargeId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TransactionController.getTransactionsByCharge
);

router.get('/get-by-payment/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TransactionController.getTransactionsByPayment
);

router.post('/add-transaction', 
  body('total_amount').notEmpty().withMessage('Total amount is required').isNumeric().withMessage('The amount must be numerical'),
  body('receiver').notEmpty().withMessage('Receiver is required'),
  body('method').notEmpty().withMessage('You must indicate the payment method'),
  handleInputErrors,
  TransactionController.addNewTransaction
);

router.patch('/edit-transaction/:transactionId',
  param('transactionId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TransactionController.editTransaction
);

router.delete('/delete-transaction/:transactionId',
  param('transactionId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TransactionController.deleteTransaction
);

export default router;