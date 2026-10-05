const crypto = require('crypto');

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

    if (new Date(userEmail.codeExpiresAt).getTime() < Date.now() || userEmail.attempts >= MAX_ATTEMPTS) {
      return res.badRequest({ message: 'emailPreference.error.codeExpired' });
    }

    const expected = Buffer.from(userEmail.verificationCode);
    const actual = Buffer.from(sails.helpers.email.hashVerificationCode(code));
    if (!crypto.timingSafeEqual(expected, actual)) {
      await UserEmail.updateOne({ id: userEmail.id }).set({ attempts: userEmail.attempts + 1 });
      return res.badRequest({ message: 'emailPreference.error.invalidCode' });
    }

    // Another user verified this email after the code was sent
    const emailOwner = await UserEmail.findOne({ email: userEmail.pendingEmail });
    if (emailOwner && emailOwner.user !== userEmail.user) {
      return res.status(409).json({ message: 'emailPreference.error.emailTaken' });
    }

    try {
      await UserEmail.updateOne({ id: userEmail.id }).set({
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

    return res.ok({ email: userEmail.pendingEmail, promotional: userEmail.promotional });
  } catch (err) {
    return res.badRequest(err);
  }
};
