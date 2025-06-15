/**
 * Identity.js
 *
 * @description :: Represents a user's profile from Oauth provider.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    user: {
      model: 'user',
    },
    provider: {
      type: 'string',
      required: true
    },
    accessToken: {
      type: 'string',
      required: true
    },
    refreshToken: {
      type: 'string',
      required: true
    },
    avatar: {
      type: 'string',
    },
    email:{
      type: 'string',
    },
    userName:{
      type: 'string',
    }
  },
};
