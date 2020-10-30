const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User=require('./userModel');
const Tour=require('./tourModel');

const reveiewSchema=new mongoose.Schema({
   review:{
       type:String,
       required:[true,'Review cannot be empty']
   },
   rating:{
       type:Number,
       max:5,min:1
   },
   createdAt:{
   type:Date,
   default:Date.now()
   },
   user:{
       type:mongoose.Schema.ObjectId,
       ref:'User',
       required:[true,'Review must belong to a user']
   },
   tour:{
       type:mongoose.Schema.ObjectId,
       ref:'Tour',
       required:[true,'Review must belong to a tour']
   }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reveiewSchema.index({tour:1,user:1},{unique:true});
reveiewSchema.pre(/^find/,function(next){
  //  this.populate({
    //    path:'tour',
      //  select:'name'
   // }).populate({
     //   path:'user',
       // select:'name photo'
   // })
   this.populate({
       path:'tour',
       select:'name'
   })
    next();
})
// reveiew/rating/createdAt/ref to tour/ref to user


reveiewSchema.statics.calcAverageRatings=async function(tourId){
 const stats =await this.aggregate([
    {
      $match:{tour:tourId}
    },
    {
      $group:{
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ]);
  console.log(stats);
  if(stats.length>0){
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:stats[0].nRating,
      ratingsAverage:stats[0].avgRating
    });
  }else{
    await Tour.findByIdAndUpdate(tourId,{
      ratingsQuantity:0,
      ratingsAverage:4.5
});
  }
  
};

reveiewSchema.post('save',function(){
  // this points to the current review

  this.constructor.calcAverageRatings(this.tour);
});

reveiewSchema.pre(/^findOneAnd/,async function(next){
  this.r=await this.findOne();
 // console.log("r ",this.r);
  next();
});


reveiewSchema.post(/^findOneAnd/,async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review=mongoose.model("Review",reveiewSchema);
module.exports=Review;