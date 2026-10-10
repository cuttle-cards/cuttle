const nodemailer = require('nodemailer');

module.exports = {
  friendlyName: 'Send Verification Email',

  description: 'Emails a 6 digit verification code using the configured gmail account',

  inputs: {
    email: {
      type: 'string',
      required: true,
    },
    code: {
      type: 'string',
      required: true,
    },
  },

  fn: async function ({ email, code }, exits) {
    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

    // Without credentials, log the code locally instead of sending it
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      if (sails.config.environment === 'production') {
        return exits.error(new Error('Email credentials are not configured'));
      }
      sails.log.info(`Email verification code for ${email}: ${code}`);
      return exits.success();
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `Cuttle <${GMAIL_USER}>`,
        to: email,
        subject: 'Your Cuttle verification code',
        text: `Your Cuttle verification code is ${code}. It expires in 10 minutes.`,
      });

      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  },
};
