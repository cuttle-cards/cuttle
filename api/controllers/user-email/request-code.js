const crypto = require('crypto');

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

module.exports = async function (req, res) {
  try {
    const { email } = req.body;
    const promotional = req.body.promotional === true;
    const userId = req.session.usr;

    // Email must not already belong to another user
    const emailOwner = await UserEmail.findOne({ email });
    if (emailOwner && emailOwner.user !== userId) {
      return res.status(409).json({ message: 'emailPreference.error.emailTaken' });
    }

    const userEmail = await UserEmail.findOne({ user: userId });

    // Limit how often a user can request a code
    const now = Date.now();
    if (userEmail?.codeSentAt && now - new Date(userEmail.codeSentAt).getTime() < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ message: 'emailPreference.error.tooManyRequests' });
    }

    const code = crypto.randomInt(0, 1_000_000).toString()
      .padStart(6, '0');
    const updates = {
      pendingEmail: email,
      verificationCode: sails.helpers.email.hashVerificationCode(code),
      codeExpiresAt: new Date(now + CODE_TTL_MS),
      codeSentAt: new Date(now),
      attempts: 0,
      promotional,
    };

    if (userEmail) {
      await UserEmail.updateOne({ id: userEmail.id }).set(updates);
    } else {
      await UserEmail.create({ user: userId, ...updates });
    }

    await sails.helpers.email.sendVerificationEmail(email, code);

    return res.ok();
  } catch (err) {
    sails.log.error(err);
    return res.badRequest({ message: 'emailPreference.error.sendFailed' });
  }
};
