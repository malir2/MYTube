// By using "Promise method"

// const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => {
//       console.log(err);
//     });
//   };
// };

// By using try/catch method
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    try {
      requestHandler(req, res, next);
    } catch (err) {
      console.log(err);
    }
  };
};

export default asyncHandler;
