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
    providerId:{
      type:'string',
      required: true
    },
    provider: {
      type: 'string',
      required: true
    },
    providerUserName:{
      type: 'string',
    }
  },
};
