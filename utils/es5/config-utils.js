// `CUTTLE_ENV` is needed to test prod specific files without actually putting the app in to
// a production state, which requires an actual database connection
const isProd =
  process.env.CUTTLE_ENV !== undefined
    ? process.env.CUTTLE_ENV === 'production'
    : process.env.NODE_ENV === 'production';

module.exports = {
  isProd,
};
