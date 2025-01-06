import express, { urlencoded } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from '@/config/db.js';
import { corsMiddleware } from '@/config/cors.js';
import customerRoutes from '@/routes/customerRoutes.js';
import supplierRoutes from '@/routes/supplierRoutes.js';
import productRoutes from '@/routes/productRoutes.js';
import paymentsRoutes from '@/routes/paymentsRoutes.js';
import stocktakingRoutes from '@/routes/stocktakingRoutes.js';
import chargeRoutes from '@/routes/chargeRoutes.js';
import transactionRoutes from '@/routes/transactionRoutes.js';
import serviceRoutes from '@/routes/serviceRoutes.js';
import reminderRoutes from '@/routes/reminderRoutes.js';
import authRoutes from '@/routes/authRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(corsMiddleware());

app.disable('x-powered-by');
app.use(express.json());
app.use(urlencoded({extended: true}));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/product', productRoutes);
app.use('/api/payment', paymentsRoutes);
app.use('/api/stock', stocktakingRoutes);
app.use('/api/charge', chargeRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/reminder', reminderRoutes);

export default app;