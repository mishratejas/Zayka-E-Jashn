import mongoose from "mongoose";

const chefProfileSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone: String,
    specialization:{
        type: String,
        enum: ['Indian', 'Continental', 'Chinese', 'Bakery', 'Multi-cuisine'],
        required: true
    },
    experience:{
        type: Number,
        required: true
    },
    resume: String,
    bio: String,
    availability:{
        type: Boolean,
        default: true
    },
    verified:{
        type: Boolean,
        default: false
    }
},{timestamps:true});

export default mongoose.model("ChefProfile", chefProfileSchema);
