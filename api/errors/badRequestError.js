class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.code = 'BAD_REQUEST';
  }
}

module.exports = BadRequestError;
