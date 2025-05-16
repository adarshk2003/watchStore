// routes/userRoutes.js
const express = require('express');
const userController= require('../controller/userController');

const router = express.Router();
const accessControl=require('../utils/access_control').accessControl;

function  setAccessControl(access_type){
    return(req,res,next)=>{
        accessControl(access_type,req,res,next);
    }
}

router.post('/users', setAccessControl('*'),userController.createUser);
router.get('/users', setAccessControl('1'),userController.getAllUsers);
router.get('/user/:id', userController.getSingleUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/userprofile', userController.viewUserProfile);
router.put('/updateUser',userController.updateUser)
router.post('/block', setAccessControl('1'), userController.blockUser);
router.post('/unblock', setAccessControl('1'), userController.unblockUser);
router.post('/requestUpgrade',setAccessControl('2'), userController.requestUpgrade);
router.put('/approveUpgrade/:id',setAccessControl('1'), userController.approveUpgrade);
router.get('/upgradeRequests',setAccessControl('1'),  userController.getAllUpgradeRequests);
router.delete('/rejectUpgrade/:id', setAccessControl('1'), userController.rejectUpgrade);


module.exports = router;
