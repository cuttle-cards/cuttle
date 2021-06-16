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
const migratePolicy = process.env.NODE_ENV === 'production' ? 'alter' : 'drop';

module.exports.models = {

  // DEVELOPMENT SETTINGS
  connection: 'localDiskDb',
  migrate: 'drop',
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },
    id: { type: 'number', autoIncrement: true},
  }

};
