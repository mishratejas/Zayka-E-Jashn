import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app=express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
import chefRoutes from "./routes/chef.routes.js";
import orderRoutes from "./routes/order.routes.js";
import managerRoutes from './routes/manager.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';

app.use("/api/v1/users",userRouter);
app.use("/api/v1/chefs",chefRoutes);
app.use("/api/v1/orders",orderRoutes);
app.use('/api/v1/manager',managerRoutes);
app.use('/api/v1/admin',adminRoutes);
app.use("/api",contactRoutes);

app.listen(3000,()=>{
    console.log("Server running at http://localhost:3000");    
});

export {app}