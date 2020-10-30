const fs = require("fs");
const AppError = require("../Utils/appError");
const Tour = require("./../models/tourModel");
const sharp=require('sharp');
const catchAsync = require("./../Utils/catchAsync");
const factory=require("./handlerFactory");
const multer=require('multer');



const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true);
  }else{
    cb(new AppError('Not an image!Please upload pnly images',400),false);
  }
}

const upload=multer({
  storage:multerStorage,
  fileFilter:multerFilter
});

// upload.single('image') req.title
// upload.array('images',5)

exports.resizeTourImages=catchAsync(async(req,res,next)=>{
  console.log(req.files);

if(!req.files.imageCover || !req.files.images) return next();

// 1) Cover image
req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/tours/${req.body.imageCover}`);
  
//2.)Images
  req.body.images=[];
  await Promise.all(
  req.files.images.map(async (file,i) => {
    const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

    await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`);
    req.body.images.push(filename);
  })
  );

  next();
});

exports.uploadTourImages=upload.fields([
  {name:'imageCover',maxCount:1},
  {name:'images',maxCount:3}
]);


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour,{path:'reviews'});
exports.createTour=factory.createOne(Tour);
exports.updateTour=factory.updateOne(Tour);
exports.deleteTour=factory.deleteOne(Tour);
//exports.deleteTour = catchAsync(async (req, res, next) => {
  //const tour = await Tour.findByIdAndDelete(req.params.id, req.body);
  //if (!tour) {
    //return next(new AppError("No tour found with that ID", 404));
 // }
  //res.status(204).json({
    //status: "success",
    //data: "null",
 // });
//});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    //{
    //$match: { $_id: { $ne: "EASY" } },
    //},
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});


exports.getTourWithin=async (req,res,next)=>{
  const {distance,latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  const radius=unit ==='mi'?distance /3963.2:distance/6378.1;

  if(!lat ||!lng){
    next(new AppError("Please provide latitude and longitude in the format in the format lat,lng"),400);
  }

  const tours=await Tour.find({
    startLocation:{$geoWithin:{$centerSphere:[[lng,lat], radius]}}
  });
  console.log(distance,lat,lng,unit);
  res.status(200).json({
    status:'success',
    results:tours.length,
    data:{
      data:tours
    }
  })
};

exports.getDistances =catchAsync(async (req,res,next)=>{
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  

  if(!lat ||!lng){
    next(new AppError("Please provide latitude and longitude in the format in the format lat,lng"),400);
  }
  const distances=await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng * 1,lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:.001
      }
    },{
      $project:{
        distance:1,
        name:1
      }
    }
  ]);
  res.status(200).json({
    status:'success',
    data:{
      data:distances
    }
  })
});
/*
const fs = require("fs");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../Utils/appFeatures");
const catchAsync = require("./../Utils/catchAsync");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // BUILD THE QUERY
    //1A) filtering
    // const queryObject = { ...req.query };
    // const excludedField = ['page', 'sort', 'limit', 'fields'];
    // excludedField.forEach((el) => delete queryObject[el]);
    // // console.log(req.query, queryObject);
    // //1B) advanced filtering

    // let queryStr = JSON.stringify(queryObject);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));
    //2) sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');

    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }

    //3) field limiting
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    //4 pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exists');
    // }

    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    //RESPONSES
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findeOne(_id: req.params.id)
    res.status(200).json({
      status: "success",

      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.createTour = catchAsync(async (req, res) => {
  // const newTour = new Tour({});
  //newTour.save();
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tours: newTour,
    },
  });
});
exports.updateTour = async (req, res) => {
  //if (id > tours.length)
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id, req.body);

    res.status(204).json({
      status: "success",
      data: "null",
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      //{
      //$match: { $_id: { $ne: "EASY" } },
      //},
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};
*/
