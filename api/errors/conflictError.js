const CustomErrorType = require('./customErrorType');

class ConflictError extends Error {
  constructor(resourceType, resourceId, message = '') {
    super(message ?? `${resourceType} ${resourceId} can't be updated like that right now`);
    this.code = CustomErrorType.CONFLICT;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

module.exports = ConflictError;
