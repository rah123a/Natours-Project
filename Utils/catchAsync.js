module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) =>{
      console.log("error is production error",err);
      next(err)});
  };
};
