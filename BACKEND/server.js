import express from 'express';
//require('dotenv').config();
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/',(req,res)=>{
    res.send("Backend chal rha h");
})
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})