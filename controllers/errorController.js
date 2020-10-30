
const AppError=require('./../utils/appError');

const handleCastErrorDB=err=>{
  const message=`Invalid ${err.path}: ${err.value}`;
  return new AppError(message,400);
}
const handleDuplicateFieldsDB=err=>{
  
  const value=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  //console.log(value);

  const message=`Duplicate field value:${value},Please use another value!`;
  return new AppError(message,400);
}

const handleValidationErrorDB=err=>{
  const errors=Object.values(err.errors).map(el=>el.message);
  const message=`Invalid input data. ${errors.join('. ')}`;
  return new AppError(message,400);
}

const handleJWTError=()=>new AppError('Invalid token. Please log in again ',401);
const handleJWTExpiredError=()=>new AppError('Your token hase expired .Please log in again ',401);

const sendErrorDev = (err,req, res) => {
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  
    //Rendered Website
    return res.status(err.statusCode).render('error',{
      title:'Something went wrong!',
      msg:err.message
    })
  
  
};

const sendErrorProd = (err, req,res) => {
 
    // A) API.................
    
  if(req.originalUrl.startsWith('/api')){
  // Operational , trusted error:semd message to the client
  if (err.isOperational) {
     return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
    //1.)Log error
    console.error("Error ", err);

    //Programming or other unknown error:don't leak error details
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  
}//B) Rendered website

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message:'Please try again later',
    });
  } 
    //1.)Log error
    console.error("Error ", err);

    //Programming or other unknown error:don't leak error details
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  

};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err,req,res);
  } else if(process.env.NODE_ENV === "production "){
    let error=Object.create(err);
    console.log("error of production is")

    if(error.name==='CastError') error=handleCastErrorDB(error);
    if(error.code===11000) error=handleDuplicateFieldsDB(error);
    if(error.name==='ValidationError') error=handleValidationErrorDB(error);
    if(error.name==='JsonWebTokenError') error=handleJWTError();
    if(error.name==='TokenExpiresError') error=handleJWTExpiredError();
    sendErrorProd(error,req,res);
  }
};
