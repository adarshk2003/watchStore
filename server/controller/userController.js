const users = require('../db/models/user');
const mongoose = require('mongoose');
const success_function = require('../utils/response-handler').success_function;
const error_function = require('../utils/response-handler').error_function;
const bcrypt = require('bcryptjs');
const UpgradeRequest = require('../db/models/upgradeReq'); // Update the path as per your folder structure

const { sendEmail } = require('../utils/sendemail');
const { blockUserTemplate } = require('../utils/template/block-user');
const{unblockUserTemplate}=require('../utils/template/unblock-user')
const { upgradeApprovalNotification } = require('../utils/template/upgrade');
const { upgradeRejectionNotification } = require('../utils/template/upgrade');

const user_type=require('../db/models/user_type')
const fileUpload = require('../utils/fileUpload').fileUpload;

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    console.log("Authorization Header:", authorizationHeader);

    // Extract token from header
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
    console.log("Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: "No token provided. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
        req.user = { id: decoded.user_id }; // Add user ID to the request
        console.log("Decoded User ID:", req.user.id);
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

exports.createUser = async function (req, res) {
    try {

        let body = req.body;
        console.log("body : ", body);


        let name = req.body.name;
        console.log("name : ", name);

        let email = req.body.email;
        console.log("email : ", email);

        let age = req.body.age;
        console.log("age : ", age);

        let password = req.body.password;
        console.log("password : ", password);

        let isSeller=req.body.isSeller;
        console.log("seller",isSeller)

        if (isSeller === true) {
            console.log("seller")
            body.user_type ='675870f3ae9c6b1dffa1a7ee' ;
        } else {
            console.log("buyer")
            body.user_type ='67587113ae9c6b1dffa1a7ef';
        }
       
        if (!name) {

            let response = error_function({
                statusCode: 400,
                message: "Name is required",
            });

            res.status(response.statusCode).send(response);
            return;
        }


       


        //Password Hashing
        let salt = bcrypt.genSaltSync(10);
        console.log("salt : ", salt);

        let hashed_password = bcrypt.hashSync(password, salt);
        console.log("hashed_password : ", hashed_password);

        let count = await users.countDocuments({ email });
        console.log("count : ", count);

        if (count > 0) {
            let response = error_function({
                statusCode: 400,
                message: "User already exists",
            });

            res.status(response.statusCode).send(response);
            return
        }

        body.password = hashed_password;
        console.log("body : ", body);
        
        let new_user = await users.create(body);

        if (new_user) {

            let response = success_function({
                statusCode: 201,
                message: "User created successfully",
            });

            res.status(response.statusCode).send(response);
            return;
        } else {

            let response = error_function({
                statusCode: 400,
                message: "User creation failed",
            })
            res.status(response.statusCode).send(response);
            return;
        }

    } catch (error) {
        console.log("error : ", error);


        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.getAllUsers = async function (req, res) {
    try {
        let usersData = await users.find();
        console.log("usersData : ", usersData);

        let response = success_function({
            statusCode: 200,
            data: usersData,
            message: "Users fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.getSingleUser = async function (req, res) {
    try {
        let id = req.params.id;
        console.log("id : ", id);

        let userData = await users.find({ _id: id });
        console.log("userData : ", userData);

        let response = success_function({
            statusCode: 200,
            data: userData,
            message: "User data fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("error : ", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        })

        res.status(response.statusCode).send(response);
        return;
    }
}

exports.deleteUser=async function (req,res) {
    try {
        let id=req.params.id;
        
        let deleteuser=await users.deleteOne({_id:id});

        if(deleteuser){
            let response=success_function({
                statusCode:200,
                message:"User deleted successfully"
            });
            res.status(response.statusCode).send(response.statusCode);  
        }
        else{
            let response=error_function({
                statusCode:400,
                message:"failed to delete"
            });
            res.status(response.statusCode).send(response.statusCode);
        }
    }
    
    catch (error) {
        console.log("error :",error);
        let response = error_function({
            statusCode : 400,
            message : error.message ? error.message : "something went wrong"
        })
        res.status(response.statusCode).send(response.statusCode);   
    }
}
// Controller function to view the logged-in user's profile
exports.viewUserProfile = [authenticate,async function (req, res) {
    try {
        // Get the logged-in user's ID from the request (added by authenticate middleware)
        const userId = req.user.id;

        // Fetch the logged-in user's profile from the database using their user ID
        let userData = await users.findById(userId);

        if (!userData) {
            return res.status(404).json({ message: "User not found." });
        }

        // Respond with the user data
        let response = success_function({
            statusCode: 200,
            data: userData,
            message: "User profile fetched successfully",
        });

        res.status(response.statusCode).send(response);
        return;

    } catch (error) {
        console.log("Error:", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
        return;
    }
}];

exports.updateUser = [authenticate, async function (req, res) {
    try {
        // Get the logged-in user's ID from the request (added by authenticate middleware)
        const userId = req.user.id;

        // Fetch the request body
        const { name, email,  address } = req.body;
        const updateFields = {};

        // Validate the fields and only update if provided
        if (name) {
            if (!/^[a-zA-Z]+([ '-][a-zA-Z]+)*$/.test(name)) {
                return res.status(400).json({ message: "Invalid name format" });
            }
            updateFields.name = name;
        }

        if (email) {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            // Check if email is already in use by another user
            const emailExists = await users.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            updateFields.email = email;
        }

       
        // Address validation (if provided)
        if (address) {
            if (typeof address !== "string" || address.trim().length === 0) {
                return res.status(400).json({ message: "Invalid address" });
            }
            updateFields.address = address.trim(); // Sanitize the input
        }

        // If no fields to update are provided
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        // Update the user record
        const updatedUser = await users.findByIdAndUpdate(userId, updateFields, {
            new: true, // Return the updated user
            runValidators: true, // Ensure validations run
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Respond with success
        let response = success_function({
            statusCode: 200,
            data: updatedUser,
            message: "User details updated successfully",
        });

        res.status(response.statusCode).send(response);

    } catch (error) {
        console.error("Error:", error);

        let response = error_function({
            statusCode: 400,
            message: error.message ? error.message : "Something went wrong",
        });

        res.status(response.statusCode).send(response);
    }
}];

exports.blockUser = [
    authenticate, // Middleware for authentication
    async function (req, res) {
        const { userId } = req.body;
        const { reason } = req.body;
  
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
      }
      try {
        // Attempt to update the user's block status
        const user = await users.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
        if (!user) {
          // User not found
          return res.status(404).json({ message: 'User not found.' });
        }
          const emailContent = await blockUserTemplate(
              user.name,
              user.email,
              reason,
              'support.clyro@gmail.com',
            
          )
          const Emailsent = await sendEmail(
              user.email,
              "user blocked notification",
              emailContent,
          )
          if (!Emailsent) {
              res.status(400).send({ message: "failed to send email " })
          }
        // Successful response
        res.status(200).json({ message: 'User blocked successfully.', user });
        console.log("user blocked successfully",user);
      } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Error blocking user.', error: error.message });
      }
    }
  ];
  
  // Unblock User
  exports.unblockUser = [
    authenticate, // Middleware for authentication
    async function (req, res) {
        const { userId } = req.body;
        const { reason } = req.body;
  
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
      }
  
      try {
        // Attempt to update the user's block status
        const user = await users.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
        if (!user) {
          // User not found
          return res.status(404).json({ message: 'User not found.' });
        }
          const emailContent = await unblockUserTemplate(
              user.name,
              user.email,
              reason,
              'support.clyro@gmail.com',

          )
          const emailSend = await sendEmail(
              user.email,
              "user unblocked notification",
              emailContent,
          )
          if (!emailSend) {
              res.status(400).send({message:"failed to send email "})
          }
        // Successful response
        res.status(200).json({ message: 'User unblocked successfully.', user });
      } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'Error unblocking user.', error: error.message });
      }
    }
  ];


  //upgrade seller request
  exports.requestUpgrade = [authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const { companyName, license } = req.body;
  
      // Check if there's already an active pending request from this user
      const existingRequest = await UpgradeRequest.findOne({ userId, status: 'pending' });
  
      if (existingRequest) {
        return res.status(400).send({ message: 'You already have a pending upgrade request.' });
      }
  
      // Create a new request if no pending request exists
      const newRequest = new UpgradeRequest({
        userId,
        companyName,
        license,
        status: 'pending',
      });
  
      const savedRequest = await newRequest.save();
      res.status(201).send({ message: 'Upgrade request submitted successfully', data: savedRequest });
    } catch (error) {
      res.status(500).send({ message: 'Something went wrong', error: error.message });
    }
  }];
  

//aprove upgrade
exports.approveUpgrade = [authenticate, async (req, res) => { 
    try { 
        const requestId = req.params.id; 
        const upgradeRequest = await UpgradeRequest.findById(requestId).populate('userId'); 

        if (!upgradeRequest) { 
            return res.status(404).send({ message: 'Upgrade request not found' }); 
        } 

        const sellerTypeId =new  mongoose.Types.ObjectId('675870f3ae9c6b1dffa1a7ee');

        const updatedUser = await users.findByIdAndUpdate(
            upgradeRequest.userId._id, 
            { user_type: sellerTypeId }, 
            { new: true }
        ); 
        
        if (!updatedUser) { 
            return res.status(404).send({ message: 'User not found' }); 
        } 

        // Delete the upgrade request after approval
        await UpgradeRequest.findByIdAndDelete(requestId); 

        // Generate email template
        const emailTemplate = await upgradeApprovalNotification(
            upgradeRequest.userId.name, 
            upgradeRequest.companyName
        );

        // Send email notification
        await sendEmail(
            upgradeRequest.userId.email, 
            'Upgrade Approved - Welcome to Seller Dashboard!', 
            emailTemplate
        );

        res.status(200).send({ 
            message: 'User upgraded to seller and request deleted', 
            data: updatedUser, 
            upgradeDetails: {
                companyName: upgradeRequest.companyName,
                license: upgradeRequest.license
            }
        }); 
    } catch (error) { 
        res.status(500).send({ message: 'Something went wrong', error: error.message }); 
    } 
}];

//view request upgrades
exports.getAllUpgradeRequests =[authenticate, async (req, res) => { 
    try { 
        const requests = await UpgradeRequest.find().populate('userId', 'name email'); 
        res.status(200).send({ message: 'Upgrade requests fetched successfully', data: requests });
    } 
    catch (error) 
    { res.status(500).send({ message: 'Something went wrong', error: error.message }); 
    } 
}];
// Reject Upgrade Request
exports.rejectUpgrade = [authenticate, async (req, res) => {
    try {
        const requestId = req.params.id;

        // Find the upgrade request
        const upgradeRequest = await UpgradeRequest.findById(requestId).populate('userId');

        if (!upgradeRequest) {
            return res.status(404).send({ message: 'Upgrade request not found' });
        }

        // Generate email template for rejection
        const emailTemplate = await upgradeRejectionNotification(
            upgradeRequest.userId.name,
            upgradeRequest.companyName
        );

        // Send rejection email notification
        await sendEmail(
            upgradeRequest.userId.email,
            'Upgrade Request Rejected',
            emailTemplate
        );

        // Delete the upgrade request
        await UpgradeRequest.findByIdAndDelete(requestId);

        res.status(200).send({
            message: 'Upgrade request rejected and deleted',
            rejectedRequest: {
                userId: upgradeRequest.userId._id,
                companyName: upgradeRequest.companyName,
                license: upgradeRequest.license
            }
        });
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong', error: error.message });
    }
}];
