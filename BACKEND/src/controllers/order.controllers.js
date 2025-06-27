import { Order } from "../models/Order.models.js";
import mongoose from "mongoose";
export const createOrder = async(req,res)=>{
    try{
        const chefId = req.chef._id;
        const{customerName,item,details} = req.body;
        if(!chefId){
            return res.status(400).json({
                success:false,
                message:"Chef ID is required"
            });
        }
        const order = await Order.create({
            chefId:new mongoose.Types.ObjectId(chefId),
            customerName,
            item,
            details
        });
        res.status(201).json({success:true,order});
    }
    catch(error){
        res.status(500).json({success:false, message:error.message});
    }
};

export const getAllOrders = async(req,res)=>{
    try{
        // const chefId = req.chef._id;
        //console.log("Chef ID from token:", chefId);
        const orders = await Order.find({
            //chefId,
            status:{$in:["pending","preparing","ready"]} 
        }).sort({createdAt: -1});
        //console.log("Fetched orders:", orders);
        res.status(200).json({success:true,orders});
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
};

export const updateOrderStatus = async(req,res)=>{
    try{
        const {id} = req.params;
        const {status} =req.body;
        const order = await Order.findByIdAndUpdate(id,{status},{new:true});
        res.json({success:true,order});
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
};
