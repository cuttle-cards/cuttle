const crypto = require('crypto');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

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
    const now = dayjs.utc();
    if (userEmail?.codeSentAt && now.diff(dayjs.utc(userEmail.codeSentAt), 'second') < RESEND_COOLDOWN_SECONDS) {
      return res.status(429).json({ message: 'emailPreference.error.tooManyRequests' });
    }

    const code = crypto.randomInt(0, 1_000_000).toString()
      .padStart(6, '0');
    const updates = {
      pendingEmail: email,
      verificationCode: sails.helpers.email.hashVerificationCode(code),
      codeExpiresAt: now.add(CODE_TTL_MINUTES, 'minute').toDate(),
      codeSentAt: now.toDate(),
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
