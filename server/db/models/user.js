const mongoose = require('mongoose');
const user_type = require('./user_type');

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    address:{
        type:String,
        required:false,
    },
    image:{
        type:String,
        required:false
    },
    user_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_types"
    },
},{ timestamps: true });
module.exports = mongoose.model("users", user);
