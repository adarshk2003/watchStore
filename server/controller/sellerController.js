const Seller = require('../db/models/seller'); 
const { fileUpload } = require('../utils/fileUpload'); 

// Get seller details
exports.getSellerData = async (req, res) => {
    const { userId } = req.params;
    try {
        const seller = await Seller.findOne({ userId: userId });
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        res.status(200).json(seller);
    } catch (error) {
        console.error('Error fetching seller details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create or update seller details
exports.createSeller = (req, res) => {
    fileUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { userId } = req.params;
        const {
            fullName, email, phoneNumber, businessName, businessType, businessAddress,
            businessRegistrationNumber, website, shippingMethods, returnPolicy, shippingLocations,
            sellerBio
        } = req.body;

        const logo = req.file ? req.file.path : null;

        try {
            let seller = await Seller.findOne({ userId: userId });
            if (seller) {
                // Update seller details
                seller.fullName = fullName;
                seller.email = email;
                seller.phoneNumber = phoneNumber;
                seller.businessName = businessName;
                seller.businessType = businessType;
                seller.businessAddress = businessAddress;
                seller.businessRegistrationNumber = businessRegistrationNumber;
                seller.website = website;
                seller.shippingMethods = shippingMethods;
                seller.returnPolicy = returnPolicy;
                seller.shippingLocations = shippingLocations;
                seller.sellerBio = sellerBio;
                if (logo) {
                    seller.logo = logo;
                }
                await seller.save();
                res.status(200).json({ message: 'Seller profile updated successfully' });
            } else {
                // Create new seller
                seller = new Seller({
                    userId,
                    fullName,
                    email,
                    phoneNumber,
                    businessName,
                    businessType,
                    businessAddress,
                    businessRegistrationNumber,
                    website,
                    shippingMethods,
                    returnPolicy,
                    shippingLocations,
                    sellerBio,
                    logo
                });
                await seller.save();
                res.status(201).json({ message: 'Seller profile created successfully' });
            }
        } catch (error) {
            console.error('Error creating/updating seller profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};
