import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import aggregatorRoutes from './routes/aggregatorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { connectDB } from './config/db.js';

const app = express();

// Ensure DB is connected for serverless environments (like Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Your backend is Live');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'whatsapp-b2b-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/webhook/aggregator', aggregatorRoutes);
app.use('/webhook', webhookRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

