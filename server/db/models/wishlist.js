const mongoose=require ('mongoose');

const wishlist=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    },
    fav: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', 
            required: true,
          },
        },
      ],
});

wishlist.index({ userId: 1 });

module.exports = mongoose.model("wishlist", wishlist);