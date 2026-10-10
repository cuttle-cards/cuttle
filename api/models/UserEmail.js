/**
 * UserEmail.js
 *
 * @description :: A user's preferred email. One row per user. The email is only persisted to
 *                 `email` after the user verifies it with the code sent to `pendingEmail`
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    user: {
      model: 'user',
      required: true,
      unique: true,
    },
    /**
     * Verified email, lowercased. Unique across users
     * @value null until the user verifies an email
     * Uniqueness is enforced in the controllers and by a unique index in postgres, because
     * sails-disk does not support `unique` on nullable attributes
     */
    email: {
      type: 'string',
      allowNull: true,
      isEmail: true,
    },
    /**
     * Email awaiting verification
     */
    pendingEmail: {
      type: 'string',
      allowNull: true,
    },
    /**
     * sha256 hash of the 6 digit code sent to pendingEmail
     */
    verificationCode: {
      type: 'string',
      allowNull: true,
    },
    codeExpiresAt: {
      type: 'ref',
      columnType: 'timestamptz',
    },
    codeSentAt: {
      type: 'ref',
      columnType: 'timestamptz',
    },
    attempts: {
      type: 'number',
      defaultsTo: 0,
    },
    promotional: {
      type: 'boolean',
      defaultsTo: false,
    },
  },
};
