const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const dotenv = require('dotenv');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { generateAiResponse } = require('./alpipeService');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required in .env');
}

neonConfig.webSocketConstructor = ws;
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().nonnegative('Price must be at least 0'),
  stock: z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative'),
  description: z.string().optional().nullable(),
});

const productUpdateSchema = productSchema.partial();
const stockUpdateSchema = z.object({
  stock: z.number().int('Stock must be an integer').nonnegative('Stock cannot be negative'),
});

const userCreateSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const chatInputSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
  message: z.string().min(1, 'Message is required'),
});

function handleError(res, error, status = 500) {
  console.error(error);
  return res.status(status).json({
    status: 'error',
    message: error?.message || 'Internal server error',
  });
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AiChat Heart API',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    res.json({ status: 'success', data: products });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/products/stock-alert', async (req, res) => {
  try {
    const threshold = Number(req.query.threshold ?? 5);
    const products = await prisma.product.findMany({ where: { stock: { lte: threshold } }, orderBy: { stock: 'asc' } });
    res.json({ status: 'success', threshold, data: products });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    res.json({ status: 'success', data: product });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/products', async (req, res) => {
  try {
    const payload = productSchema.parse(req.body);
    const product = await prisma.product.create({ data: payload });
    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    handleError(res, error);
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const payload = productUpdateSchema.parse(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data: payload });
    res.json({ status: 'success', data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    handleError(res, error);
  }
});

app.patch('/products/:id/stock', async (req, res) => {
  try {
    const payload = stockUpdateSchema.parse(req.body);
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { stock: payload.stock } });
    res.json({ status: 'success', data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    handleError(res, error);
  }
});

app.post('/users', async (req, res) => {
  try {
    const payload = userCreateSchema.parse(req.body);
    const hashedPassword = bcrypt.hashSync(payload.password, 10);
    const user = await prisma.user.create({ data: { username: payload.username, password: hashedPassword } });
    res.status(201).json({ status: 'success', data: { id: user.id, username: user.username } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ status: 'fail', message: 'Username already exists' });
    }
    handleError(res, error);
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, username: true } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.json({ status: 'success', data: user });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/chats', async (req, res) => {
  try {
    const userId = req.query.userId;
    const where = typeof userId === 'string' ? { userId } : undefined;
    const chats = await prisma.chatHistory.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ status: 'success', data: chats });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/ai/chat', async (req, res) => {
  try {
    const payload = chatInputSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const aiResponse = await generateAiResponse(payload.message);
    const chat = await prisma.chatHistory.create({
      data: {
        userId: payload.userId,
        message: payload.message,
        response: aiResponse,
      },
    });

    res.status(201).json({ status: 'success', data: { chat, aiResponse } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    handleError(res, error);
  }
});

app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ status: 'error', message: 'Unhandled server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});