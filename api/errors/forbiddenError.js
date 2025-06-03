const CustomErrorType = require('./customErrorType');

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.code = CustomErrorType.FORBIDDEN;
  }
}

module.exports = ForbiddenError;
