//XKGQunnYyPhW3dP
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace("<PASSWORD>", "XKGQunnYyPhW3dP");

mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex:true
  })
  .catch((err) => {
    console.log(
      "error is........................................................."
    );
    console.log(err);
  })
  .then((con) => {
    //console.log(con.connections);
    console.log("Successfull");
  });

//console.log(process.env);
const port = process.env.PORT || 3000;
const server=app.listen(port, () => {
  console.log(`app running on ${port}....`);
});

process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log("Unhandled rejection shutting down");
  server.close(()=>{
    process.exit(1);
  });
});
process.on('uncaughtException',err=>{
  console.log("UnCaught  exception, shutting down");
  console.log(err.name,err.message);
  
  server.close(()=>{
    process.exit(1);
  });
});