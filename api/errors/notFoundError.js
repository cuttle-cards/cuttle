const CustomErrorType = require('./customErrorType');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = CustomErrorType.NOT_FOUND;
  }
}

module.exports = NotFoundError;
