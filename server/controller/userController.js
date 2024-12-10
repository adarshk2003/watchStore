const User = require('../models/user');
const bcrypt = require('bcrypt');

// Handle User Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password, isSeller } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ name, email, password: hashedPassword, isSeller });
        await newUser.save();

        if (isSeller) {
            // Redirect to seller form if registering as a seller
            res.redirect(`/seller-form/${newUser._id}`);
        } else {
            res.status(201).json(newUser);
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};
