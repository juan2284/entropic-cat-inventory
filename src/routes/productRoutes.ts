import { Router } from "express";
import { body, param } from "express-validator";
import productExists from "@/middlewares/productExist.js";
import { handleInputErrors } from "@/middlewares/validation.js";
import { ProductController } from "@/controllers/ProductController.js";

const router = Router();
router.param('productId', productExists);

router.get('/', ProductController.getProducts);

router.get('/:productId',
  param('productId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ProductController.getProductById
);

router.post('/add-product', 
  body('code').notEmpty().withMessage('Product code is required'),
  body('brand').notEmpty().withMessage('Product brand is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('type').notEmpty().withMessage('You must specify the type of product'),
  body('description').notEmpty().withMessage('You must provide a description of the product'),
  body('category').notEmpty().withMessage('You must provide a category for the product'),
  body('image').notEmpty().withMessage('You must provide an url for the image'),
  handleInputErrors,
  ProductController.addNewProduct
);

router.put('/edit-product/:productId',
  param('productId').isMongoId().withMessage('Invalid ID'),
  body('code').notEmpty().withMessage('Product code is required'),
  body('brand').notEmpty().withMessage('Product brand is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('type').notEmpty().withMessage('You must specify the type of product'),
  body('description').notEmpty().withMessage('You must provide a description of the product'),
  body('category').notEmpty().withMessage('You must provide a category for the product'),
  body('image').notEmpty().withMessage('You must provide an url for the image'),
  handleInputErrors,
  ProductController.editProduct
);

router.delete('/delete-product/:productId',
  param('productId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ProductController.deleteProduct
);

export default router;