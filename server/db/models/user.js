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
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    passwordResetOtpHash: {
        type: String,
        select: false,
    },
    passwordResetOtpExpiresAt: {
        type: Date,
        select: false,
    },
    passwordResetOtpSentAt: {
        type: Date,
        select: false,
    },
    passwordResetOtpAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    address:{
        type:String,
        required:false,
    },
    image:{
        type:String,
        required:false,
    },
    user_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user_types"
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
},{ timestamps: true });

user.index({ createdAt: -1, _id: -1 });
user.index({ user_type: 1, isBlocked: 1, createdAt: -1, _id: -1 });
user.index(
    { email: 1 },
    { name: 'email_ci_lookup', collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model("users", user);
