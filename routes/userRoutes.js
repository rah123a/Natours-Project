const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
const multer=require("multer");

const upload=multer({dest:'public/img/users'});

const Router = express.Router();
Router.post('/signup',authController.signup);
Router.post('/login',authController.login);
Router.post('/logout',authController.logout);
Router.post('/forgotPassword',authController.forgotPassword);
Router.patch('/resetPassword/:token',authController.resetPassword);

// Protect all routes after this
Router.use(authController.protect); // authnetication of user will be done here

Router.patch('/updateMyPassword',authController.updatePassword);
Router.get('/me',userController.getMe,userController.getUser);
Router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
Router.delete('/deleteMe',userController.deleteMe);
  
Router.use(authController.restrictTo('admin'));

Router.route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
Router.route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

 
module.exports = Router;
