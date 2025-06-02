const CustomErrorType = require('./customErrorType');

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.code = CustomErrorType.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
