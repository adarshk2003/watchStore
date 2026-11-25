const mongoose=require('mongoose');

const cart=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    },
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'products',
                require:true,
            },
            quantity:{
                type:Number,
                require:true,
                min:1,
                default:1,
            },
        },
    ],
});

cart.index({ userId: 1 });

module.exports=mongoose.model("cart",cart)