/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {
  // DEVELOPMENT SETTINGS
  datastore: 'default',
  migrate: 'drop',
  attributes: {
    createdAt: { type: 'ref', columnType: 'timestamptz', autoCreatedAt: true },
    updatedAt: { type: 'ref', columnType: 'timestamptz', autoUpdatedAt: true },
    id: { type: 'number', autoIncrement: true },
  },
  /******************************************************************************
   *                                                                             *
   * The set of DEKs (data encryption keys) for at-rest encryption.              *
   * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.   *
   *                                                                             *
   * > The `default` DEK is used for all new encryptions, but multiple DEKs      *
   * > can be configured to allow for key rotation.  In production, be sure to   *
   * > manage these keys like you would any other sensitive credential.          *
   *                                                                             *
   * > For more info, see:                                                       *
   * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys  *
   *                                                                             *
   ******************************************************************************/
  dataEncryptionKeys: {
    default: 'C17NfJDm5JMk3a7a16NOWH0WGxA4o66q0wPKah+v3/I=',
  },
};
