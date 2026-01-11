module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      isSuccess: false,
      message: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "production") {
    // Send only operational errors to client
    if (err.isOperational) {
      return res
        .status(err.statusCode)
        .json({ isSuccess: false, message: err.message });
    }

    // Unknown error — hide internals
    return res.status(500).json({
      isSuccess: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
