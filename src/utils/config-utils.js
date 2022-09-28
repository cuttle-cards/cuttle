// `CUTTLE_ENV` is needed to test prod specific files without actually putting the app in to
// a production state, which requires an actual database connection
export const isProd =
  import.meta.env.CUTTLE_ENV !== undefined
    ? import.meta.env.CUTTLE_ENV === 'production'
    : import.meta.env.NODE_ENV === 'production';
