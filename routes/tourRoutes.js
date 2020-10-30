const express = require("express");
const tourController = require("./../controllers/tourController");
const Router = express.Router();
const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
const reviewRouter=require("./../routes/reviewRoutes");


    
//Router.route('/:tourId/reviews')
//.post(

Router.use("/:tourId/reviews",reviewRouter);

//Router.param("id", tourController.checkID);
Router.route("/top-5-cheap").get(
  tourController.aliasTopTours,
  tourController.getAllTours
);

Router.route("/tour-stats").get(tourController.getTourStats);

Router.route("/monthly-plan/:year").get(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.getMonthlyPlan);

Router.route("/tours-within/:distance/center/:latlng/unit/:unit")
.get(tourController.getTourWithin);

Router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);



Router.route("/")
  .get(tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);

  Router.route("/:id")
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
    )
  .delete(
  authController.protect,
  authController.restrictTo('admin','lead-guide'),
  tourController.deleteTour
  );

module.exports = Router;
