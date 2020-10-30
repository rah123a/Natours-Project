
const crypto=require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { create } = require('./tourModel');
const { stringify } = require('querystring');
 
const userSchema = new mongoose.Schema({
  name: {
    type: 'string',
    require: [true, 'Please tell us your name']
  },
  email: {
    type: 'string',
    require: [true, 'Please provided us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide an email']
  },
  photo:{
    type:String,default:'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: 'string',
    require: [true, 'Please provided us your password'],
    minlength: 8,
    select: false
  },
  passWordConfirm: {
    type: String,
    require: [true, 'Please conforim your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      massage: 'Password are not matched '
    }
  },
passwordChangedAt: Date,
passwordResetToken:String,
passwordResetExpires:Date,
active:{
  type:Boolean,
  default:true,
  select:false
}
});
/* 
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passWordConfirm = undefined;
  next();
});
 

userSchema.pre('save',function(next){
  if(!this.isModified('password')||this.isNew) return next();

  this.passwordChangedAt=Date.now();
  next();
});*/

userSchema.pre(/^find/,function(next){
         // this points to current query
         this.find({active:{$ne:false}});
         next();
})

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
 
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


userSchema.methods.createPasswordResetToken=function(){
  const resetToken=crypto.randomBytes(32).toString('hex');
  this.passwordResetToken=crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
//console.log({resetToken},this.passwordResetToken);
//console.log("hello")

  this.passwordResetExpires=Date.now()+10*60*100000;
  console.log("this.passwordResetExpires in ...",this.passwordResetExpires);
  return resetToken;
}



const User = mongoose.model('User', userSchema);
 
module.exports = User;
/*userSchema.methods.createPasswordResetToken=function(){
  const resetToken=crypto.randomBytes(32).toString('hex');
  this.passwordResetToken=crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');
console.log({resetToken},this.passwordResetToken);

  this.passwordResetExpires=Date.now()+10*60*1000;
  return resetToken;
}



const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt=require("bcryptjs");

const userSchema=new mongoose.Schema( {
        name:{
            type:String,
            requierd:[true,'Please tell us your name!']
        },
        email:{
            type:String,
            required:[true,'Please provide your email'],
            unique:true,
            lowercase:true,
            validate:[validator.isEmail]
        },
        photo:String,
        password:{
            type:String,
            required:[true,'please provide a password'],
            minlength:8,
            select:false
        },
        passwordConfirm:{
            type:String,
            required:[true,'Please confirm your password'],
            validate:{
                //..This only works for create  'SAVE'  user.save()for update
                validator:function(val){
                    return val ===this.password;
                },
                message:'Passwords are not the same'
            }
        },
        passwordChangesAt:Date
});

userSchema.pre('save', async function(next){
    // Only run this functoin if password was actually modified
    if(!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password= await bcrypt.hash(this.password,12);
    // Delete passwordconfirm field
    this.passwordConfirm=undefined;
    next()
})

userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      console.log(changedTimestamp, JWTTimestamp);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  };
//userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
  //  if(this.passwordChangesAt){
    //   const c=this.passwordChangesAt.getTime();
      // console.log("avx",c,JWTTimestamp );
    //}
    //return false;
//}
const User=mongoose.model('User',userSchema);
module.exports=User;*/