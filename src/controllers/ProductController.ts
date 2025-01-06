import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product.js';

export class ProductController {

  static getProducts = async (req: Request, res: Response) => {
    try {
      const products = await Product.find();

      if (products.length === 0) {
        const error = new Error('There are no registered products yet');
        return res.status(404).json({error: error.message});
      }

      return res.json(products);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static getProductById = async (req: Request, res: Response) => {
    const { product } = req;
    try {
      return res.json(product);
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static addNewProduct = async (req: Request, res: Response) => {
    const product = new Product(req.body);
    const productExist = await Product.findOne({code: req.body.code});

    if (productExist) {
      const error = new Error('The product already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      product.save();
      return res.json({msg: 'Product created successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static editProduct = async (req: Request, res: Response) => {
    const product: IProduct = req.product;
    const updatedProduct: IProduct = req.body;
    const codeExist = await Product.find().where('code').equals(updatedProduct.code);

    if (product.code !== updatedProduct.code && codeExist.length !== 0) {
      const error = new Error('The product already exists');
      return res.status(409).json({error: error.message});
    }

    try {
      product.code = updatedProduct.code;
      product.name = updatedProduct.name;
      product.brand = updatedProduct.brand;
      product.type = updatedProduct.type;
      product.description = updatedProduct.description;
      product.category = updatedProduct.category;
      product.image = updatedProduct.image;

      await product.save();
      return res.json({msg: 'Product edited successfully'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

  static deleteProduct = async (req: Request, res: Response) => {
    const { product } = req;
    try {
      await product.deleteOne();
      return res.json({msg: 'Product successfully deleted'});
    } catch (error) {
      console.log(error);
      const err = new Error('Server error');
      return res.status(500).json({error: err.message});
    }
  }

}