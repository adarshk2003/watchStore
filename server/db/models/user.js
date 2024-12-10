const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    image: {
        type: String,
        required: false
    },
    user_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_types"
    },
    isSeller: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
