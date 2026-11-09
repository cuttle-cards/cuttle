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

    // Email must not already be verified by any user, including this one
    const prevEmail = await UserEmail.findOne({ email });
    if (prevEmail) {
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
      // Staged like pendingEmail, so abandoning verification doesn't change the stored opt-in
      pendingPromotional: promotional,
    };

    // Claim the cooldown before sending. Every send writes a new code hash, so the update only
    // matches if no parallel request has sent a code since we read the row
    let claimed;
    if (userEmail) {
      claimed = await UserEmail.updateOne({ id: userEmail.id, verificationCode: userEmail.verificationCode })
        .set(updates);
    } else {
      try {
        claimed = await UserEmail.create({ user: userId, ...updates }).fetch();
      } catch (err) {
        // A parallel request created this user's row first
        if (err.code !== 'E_UNIQUE') {
          throw err;
        }
      }
    }
    if (!claimed) {
      return res.status(429).json({ message: 'emailPreference.error.tooManyRequests' });
    }

    try {
      await sails.helpers.email.sendVerificationEmail(email, code);
    } catch (err) {
      // Don't hold the user in the cooldown for a code they never got. Matching on this request's
      // code hash means a newer request's cooldown is never cleared, and leaving the hash in place
      // keeps the claim above guarding parallel requests
      await UserEmail.updateOne({ id: claimed.id, verificationCode: claimed.verificationCode })
        .set({ codeSentAt: null });
      throw err;
    }

    return res.ok();
  } catch (err) {
    sails.log.error(err);
    return res.badRequest({ message: 'emailPreference.error.sendFailed' });
  }
};
