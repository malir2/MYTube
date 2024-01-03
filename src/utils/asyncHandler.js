// By using "Promis method"

// const asyncHandler = (requestHandler) => {
//   (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => {
//       console.log(err);
//     });
//   };
// };

// By using try/catch method
const asyncHandler = (requestHandler) => {
  async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (err) {
      console.log(err);
    }
  };
};

export default asyncHandler;
