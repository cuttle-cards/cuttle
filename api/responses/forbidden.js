module.exports = function forbidden(reason) {
  const data = reason ?? { message: 'Forbidden' };
  return this.res.status(403).json(data);
};
