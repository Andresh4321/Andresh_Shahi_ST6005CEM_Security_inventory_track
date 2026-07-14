import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { connectDB } from './database/db';
import { PORT } from './config';
import authRoutes from "./routes/auth/auth.route";
import cors from 'cors';
import path from "path";
import adminUserRoutes from './routes/admin/user.route';
import supplierRoutes from './routes/supplier/supplier.route';
import materialRoutes from './routes/material/material.route';
import stockRoutes from './routes/stock/stock.route';
import billRoutes from './routes/BillofMaterials/bill.route';
import recipeRoutes from './routes/ingredients/ingredients.route';
import productionRoutes from './routes/production/production.route';
import messageRoutes from './routes/messaging/message.route';

const app: Application = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Mount auth routes
app.use('/api/auth', authRoutes);

// Mount admin user routes
app.use('/api/admin/users', adminUserRoutes);

// Mount material routes
app.use('/api/materials', materialRoutes);

// Mount stock routes
app.use('/api/stock', stockRoutes);

// Mount bill of materials routes
app.use('/api/bill-of-materials', billRoutes);

// Mount recipe/ingredients routes
app.use('/api/recipes', recipeRoutes);

// Mount production routes
app.use('/api/production', productionRoutes);

// Mount supplier routes
app.use('/api/suppliers', supplierRoutes);

// Mount messaging routes
app.use('/api/messages', messageRoutes);

// serve uploads and public item photos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/items/photos', express.static(path.join(__dirname, '../public/item_photos')));
app.use('/public/items_photos',
  express.static(path.join(__dirname, '../public/item_photos'))
);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ 
        success: true, 
        message: "Welcome to Business Track API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            materials: "/api/materials",
            stock: "/api/stock",
            billOfMaterials: "/api/bill-of-materials",
            recipes: "/api/recipes",
            production: "/api/production",
            suppliers: "/api/suppliers",
            messages: "/api/messages",
            admin: "/api/admin/users"
        }
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Not Found' });
});

// basic error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // log server-side error
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;