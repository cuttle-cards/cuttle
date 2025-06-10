/**
 * CustomErrorTypes.js
 * Enum of the allowed custom error types
 * Each corresponds to a sub-class of error
 * defined in api/errors e.g. BadRequestError
 * 
 * Those error sub-classes just add a `code`
 * with the value specified by these enum vals
 */
module.exports = {
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
};
