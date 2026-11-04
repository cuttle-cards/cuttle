const crypto = require('crypto');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const MAX_ATTEMPTS = 5;

module.exports = async function (req, res) {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    if (!/^\d{6}$/.test(code)) {
      return res.badRequest({ message: 'emailPreference.error.invalidCode' });
    }

    const userEmail = await UserEmail.findOne({ user: req.session.usr });
    if (!userEmail?.pendingEmail || !userEmail.verificationCode) {
      return res.badRequest({ message: 'emailPreference.error.noPendingEmail' });
    }

    if (dayjs.utc().isAfter(dayjs.utc(userEmail.codeExpiresAt)) || userEmail.attempts >= MAX_ATTEMPTS) {
      return res.badRequest({ message: 'emailPreference.error.codeExpired' });
    }

    // Reserve this attempt before checking the code. The update only matches if no parallel
    // request has used the same attempt, so parallel guesses can't exceed MAX_ATTEMPTS
    const reserved = await UserEmail.updateOne({ id: userEmail.id, attempts: userEmail.attempts })
      .set({ attempts: userEmail.attempts + 1 });
    if (!reserved) {
      return res.status(429).json({ message: 'emailPreference.error.tooManyRequests' });
    }

    const expected = Buffer.from(userEmail.verificationCode);
    const actual = Buffer.from(sails.helpers.email.hashVerificationCode(code));
    if (!crypto.timingSafeEqual(expected, actual)) {
      return res.badRequest({ message: 'emailPreference.error.invalidCode' });
    }

    // Another user verified this email after the code was sent
    const emailOwner = await UserEmail.findOne({ email: userEmail.pendingEmail });
    if (emailOwner && emailOwner.user !== userEmail.user) {
      return res.status(409).json({ message: 'emailPreference.error.emailTaken' });
    }

    let saved;
    try {
      // Only save if no newer code was requested since we read the row
      saved = await UserEmail.updateOne({
        id: userEmail.id,
        pendingEmail: userEmail.pendingEmail,
        verificationCode: userEmail.verificationCode,
      }).set({
        email: userEmail.pendingEmail,
        pendingEmail: null,
        verificationCode: null,
        codeExpiresAt: null,
        attempts: 0,
      });
    } catch (err) {
      // Postgres unique index caught a concurrent verification of the same email
      if (err.code === 'E_UNIQUE') {
        return res.status(409).json({ message: 'emailPreference.error.emailTaken' });
      }
      throw err;
    }
    if (!saved) {
      return res.badRequest({ message: 'emailPreference.error.codeExpired' });
    }

    return res.ok({ email: userEmail.pendingEmail, promotional: userEmail.promotional });
  } catch (err) {
    return res.badRequest(err);
  }
};
