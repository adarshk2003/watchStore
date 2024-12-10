const express = require('express');
const router = express.Router();
const Seller = require('../models/seller');
const User = require('../models/user');

// Handle Seller Form Submission
exports.createSellerProfile = async (req, res) => {
    try {
        const { businessName, businessAddress } = req.body;
        const userId = req.params.userId;

        // Find user and update isSeller flag
        const user = await User.findById(userId);
        user.isSeller = true;
        await user.save();

        // Create new seller profile
        const newSeller = new Seller({ user: userId, businessName, businessAddress });
        await newSeller.save();

        res.status(201).json({ user, seller: newSeller });
    } catch (error) {
        res.status(500).json({ message: "Error creating seller", error });
    }
};

// Fetch User Data for Seller Form
exports.getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data", error });
    }
};
