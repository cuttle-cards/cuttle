class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.code = 'FORBIDDEN';
  }
}

module.exports = ForbiddenError;
