import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema({
    chefId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"ChefProfile",
        required: false
    },
    item:[
        {
            itemId:String,
            name:String,
            price:Number,
            quantity:Number,
            image:String
        }
    ],
    subtotal:Number,
    tax:Number,
    total:Number,
    type:String,
    details:mongoose.Schema.Types.Mixed,
    status:{
        type:String,
        enum:['pending', 'preparing', 'ready', 'dispatched', 'completed', 'cancelled'],
        default:'pending'
    },
    paymentMethod:{
        type: String,
        enum:["Cash","Card","UPI","Wallet"],
        default: "Cash"
    },
},{timestamps:true});

export const Order = mongoose.model('Order',OrderSchema);