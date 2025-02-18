const badWordsEn = require('../../src/util/badWordsEn');
/**
 * hasNoProfanity
 *
 * @module      :: Policy
 * @description :: Only allow usernames and gamenames with no profanity
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function (req, res, next) {
  const username = req.body.username?.trim() ?? '';
  const gameName = req.body.gameName?.trim() ?? '';
  // Check Profanity 
  if(hasProfanity(username) || hasProfanity(gameName)) {
    return res.badRequest({ message: 'Please use respectful langauge' });
  }
  return next();
};

function hasProfanity(userInput) {
  return badWordsEn.some(word => userInput.toLowerCase().includes(word)) ? true : false;
}

