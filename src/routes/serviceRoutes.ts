import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "@/middlewares/validation.js";
import { ServiceController } from "@/controllers/ServiceController.js";
import serviceExists from "@/middlewares/serviceExist.js";

const router = Router();
router.param('serviceId', serviceExists);

router.get('/', ServiceController.getServices);

router.get('/:serviceId',
  param('serviceId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ServiceController.getServicesById
);

router.get('/get-services/:customerId',
  param('customerId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ServiceController.getServicesByCustomer
);

router.get('/get-service-payment/:paymentId',
  param('paymentId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ServiceController.getServicesByPayment
);

router.post('/add-service',
  body('customer').notEmpty().withMessage('Customer is required').isMongoId().withMessage('Invalid ID'), 
  body('payment').notEmpty().withMessage('Payment is required').isMongoId().withMessage('Invalid ID'), 
  body('vehicle').notEmpty().withMessage('The vehicle is required'),
  body('type_oil').notEmpty().withMessage('The type of oil is required'),
  body('brand_oil').notEmpty().withMessage('The brand of the oil is required'),
  body('filter').notEmpty().withMessage('The filter is required'),
  body('mileage').notEmpty().withMessage('The mileage is required'),
  handleInputErrors,
  ServiceController.addNewService
);

router.patch('/edit-service/:serviceId',
  param('serviceId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ServiceController.editService
);

router.delete('/delete-service/:serviceId',
  param('serviceId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ServiceController.deleteService
);

export default router;