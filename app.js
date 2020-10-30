const express = require("express");
const app = express();
const fs = require("fs");
const path=require("path");
const morgan = require("morgan");
const AppError = require("./Utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const rateLimit=require("express-rate-limit");
const helmet=require("helmet");
const mongosanitize=require("express-mongo-sanitize");
const xss=require("xss-clean");
const { mongo } = require("mongoose");
const hpp=require("hpp");
const reviewRouter=require("./routes/reviewRoutes");
const viewRouter=require("./routes/viewRoutes");
const bookingRouter=require("./routes/bookingRoutes");
const csp = require('express-csp');
const coookieParser=require("cookie-parser");
const cookieParser = require("cookie-parser");


const cors = require('cors');    //ofcourse after installing CORS

app.use(
  cors({
    origin: '127.0.0.1:3000',
    credentials: true,
  })
);
//....for map........................................................
csp.extend(app, {
    policy: {
        directives: {
            'default-src': ['self'],
            'style-src': ['self', 'unsafe-inline', 'https:'],
            'font-src': ['self', 'https://fonts.gstatic.com'],
            'script-src': [
                'self',
                'unsafe-inline',
                'data',
                'blob',
                'https://js.stripe.com',
                'https://api.mapbox.com',
            ],
            'worker-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://js.stripe.com',
                'https://api.mapbox.com',
            ],
            'frame-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://js.stripe.com',
                'https://api.mapbox.com',
            ],
            'img-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://js.stripe.com',
                'https://api.mapbox.com',
            ],
            'connect-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://api.mapbox.com',
                'https://events.mapbox.com',
            ],
        },
    },
});


app.set('view engine','pug');
app.set("views",path.join(__dirname,'views'));
// Serving static files
app.use(express.static(path.join(__dirname,'public')));

// Set secutity HTTP headers
app.use(

  helmet({   

             contentSecurityPolicy: false

           })

);

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//  GLOBAl MIDDLEWARES

//Limit requests from same api
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP,please try again in an hour!'
});
app.use('/api',limiter);


//1.)MIDDLEWARES

// Body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongosanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));



app.use((req,res,next)=>{
  req.requestTime=new Date().toISOString();
  console.log(req.cookies);
  next();
})

app.use((req, res, next) => {
 // console.log("Hello from the middleware");
  next();
});
//2.)ROutes
app.use('/',viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

//3.) URL that did not match
app.all("*", (req, res, next) => {
  //const err = new Error(` Can,'t find ${req.originalUrl} on this server`);
  //err.status = "fail";
  //err.statusCode = 404;
  next(new AppError(` Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;


//"email":"admin@natours.io",
//"password":"test1234"