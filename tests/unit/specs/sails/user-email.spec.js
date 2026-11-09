import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const signup = async (username) => {
  const agent = request.agent(globalThis.sailsApp);
  const res = await agent.post('/api/user/signup').send({ username, password: 'password123' });
  expect(res.statusCode).toBe(200);
  return { agent, userId: res.body };
};

// Codes are hashed, so tests set a known code directly on the row
const setKnownCode = async (userId, code = '123456') => {
  await UserEmail.updateOne({ user: userId }).set({
    verificationCode: sails.helpers.email.hashVerificationCode(code),
  });
  return code;
};

describe('User preferred email', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('Requires login', async () => {
    const app = request(globalThis.sailsApp);
    const codeRes = await app.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    expect(codeRes.statusCode).toBe(401);
    const verifyRes = await app.post('/api/user/email/verify').send({ code: '123456' });
    expect(verifyRes.statusCode).toBe(401);
  });

  it('Returns no email for a new user', async () => {
    const { agent } = await signup('myUser');
    const { body } = await agent.get('/api/user/status');
    expect(body.email).toBeNull();
    expect(body.promotional).toBe(false);
  });

  it('Rejects invalid email formats', async () => {
    const { agent } = await signup('myUser');
    for (const email of [ '', 'not-an-email', 'a@b', 'a b@c.com', 42 ]) {
      const res = await agent.post('/api/user/email/request-code').send({ email });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('emailPreference.error.invalidEmail');
    }
  });

  it('Does not persist the email until the code is verified', async () => {
    const { agent, userId } = await signup('myUser');

    const res = await agent.post('/api/user/email/request-code').send({ email: ' Me@Example.com ', promotional: true });
    expect(res.statusCode).toBe(200);

    const row = await UserEmail.findOne({ user: userId });
    expect(row.email).toBeNull();
    expect(row.pendingEmail).toBe('me@example.com');
    expect(row.verificationCode).toMatch(/^[a-f0-9]{64}$/);

    const code = await setKnownCode(userId);
    const verifyRes = await agent.post('/api/user/email/verify').send({ code });
    expect(verifyRes.statusCode).toBe(200);

    expect(verifyRes.body).toEqual({ email: 'me@example.com', promotional: true });
    const { body } = await agent.get('/api/user/status');
    expect(body.email).toBe('me@example.com');
    expect(body.promotional).toBe(true);

    const verified = await UserEmail.findOne({ user: userId });
    expect(verified.pendingEmail).toBeNull();
    expect(verified.verificationCode).toBeNull();
  });

  it('Keeps one row per user', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'first@example.com' });
    await UserEmail.updateOne({ user: userId }).set({ codeSentAt: dayjs.utc().subtract(1, 'hour')
      .toDate() });
    await agent.post('/api/user/email/request-code').send({ email: 'second@example.com' });

    const rows = await UserEmail.find({ user: userId });
    expect(rows).toHaveLength(1);
    expect(rows[0].pendingEmail).toBe('second@example.com');
  });

  it('Rate limits code requests', async () => {
    const { agent } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    const res = await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    expect(res.statusCode).toBe(429);
  });

  it('Rejects wrong codes and locks after 5 attempts', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    const code = await setKnownCode(userId);

    for (let i = 0; i < 5; i++) {
      const res = await agent.post('/api/user/email/verify').send({ code: '000000' });
      expect(res.body.message).toBe('emailPreference.error.invalidCode');
    }
    const res = await agent.post('/api/user/email/verify').send({ code });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('emailPreference.error.codeExpired');
  });

  it('Rejects expired codes', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    const code = await setKnownCode(userId);
    await UserEmail.updateOne({ user: userId }).set({ codeExpiresAt: dayjs.utc().subtract(1, 'second')
      .toDate() });

    const res = await agent.post('/api/user/email/verify').send({ code });
    expect(res.body.message).toBe('emailPreference.error.codeExpired');
  });

  it('Does not allow an email verified by another user', async () => {
    const { agent: firstAgent, userId: firstId } = await signup('firstUser');
    await firstAgent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    await firstAgent.post('/api/user/email/verify').send({ code: await setKnownCode(firstId) });

    // Requesting a code doesn't reveal that the address is taken
    const { agent: secondAgent, userId: secondId } = await signup('secondUser');
    const codeRes = await secondAgent.post('/api/user/email/request-code').send({ email: 'ME@example.com' });
    expect(codeRes.statusCode).toBe(200);

    // Only someone with the code, i.e. the mailbox owner, learns it's taken
    const res = await secondAgent.post('/api/user/email/verify').send({ code: await setKnownCode(secondId) });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('emailPreference.error.emailTaken');
    const secondRow = await UserEmail.findOne({ user: secondId });
    expect(secondRow.email).toBeNull();
  });

  it('Does not send a code for an email the user already verified', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    await agent.post('/api/user/email/verify').send({ code: await setKnownCode(userId) });
    await UserEmail.updateOne({ user: userId }).set({ codeSentAt: dayjs.utc().subtract(1, 'hour')
      .toDate() });

    const res = await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('emailPreference.error.emailTaken');
  });

  it('Returns 409 when another user verifies the same email first', async () => {
    const { agent: firstAgent, userId: firstId } = await signup('firstUser');
    const { agent: secondAgent, userId: secondId } = await signup('secondUser');
    await firstAgent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    await secondAgent.post('/api/user/email/request-code').send({ email: 'me@example.com' });

    await firstAgent.post('/api/user/email/verify').send({ code: await setKnownCode(firstId) });
    const res = await secondAgent.post('/api/user/email/verify').send({ code: await setKnownCode(secondId) });
    expect(res.statusCode).toBe(409);

    const secondRow = await UserEmail.findOne({ user: secondId });
    expect(secondRow.email).toBeNull();
  });

  it('Does not change the stored opt-in until the new email is verified', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'first@example.com', promotional: true });
    await agent.post('/api/user/email/verify').send({ code: await setKnownCode(userId) });
    await UserEmail.updateOne({ user: userId }).set({ codeSentAt: dayjs.utc().subtract(1, 'hour')
      .toDate() });

    // Start changing the email and opt out, but abandon before verifying
    await agent.post('/api/user/email/request-code').send({ email: 'second@example.com', promotional: false });
    const { body: abandoned } = await agent.get('/api/user/status');
    expect(abandoned.email).toBe('first@example.com');
    expect(abandoned.promotional).toBe(true);

    // Verifying applies the new opt-in along with the new email
    const res = await agent.post('/api/user/email/verify').send({ code: await setKnownCode(userId) });
    expect(res.body).toEqual({ email: 'second@example.com', promotional: false });
  });

  it('Does not start the cooldown when the email fails to send', async () => {
    const { agent, userId } = await signup('myUser');
    // Without gmail credentials the email helper fails in production instead of logging the code
    const { environment } = sails.config;
    sails.config.environment = 'production';
    try {
      const res = await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('emailPreference.error.sendFailed');
    } finally {
      sails.config.environment = environment;
    }

    const row = await UserEmail.findOne({ user: userId });
    expect(row.codeSentAt).toBeNull();
    const retry = await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    expect(retry.statusCode).toBe(200);
  });

  it('Sends only one code when requests race', async () => {
    const { agent, userId } = await signup('myUser');
    const sendCode = () => agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });

    // First request creates the row, the rest race to update it after the cooldown
    const firstRace = await Promise.all([ sendCode(), sendCode(), sendCode() ]);
    expect(firstRace.filter((res) => res.statusCode === 200)).toHaveLength(1);

    await UserEmail.updateOne({ user: userId }).set({ codeSentAt: dayjs.utc().subtract(1, 'hour')
      .toDate() });
    const secondRace = await Promise.all([ sendCode(), sendCode(), sendCode() ]);
    expect(secondRace.filter((res) => res.statusCode === 200)).toHaveLength(1);
    expect(secondRace.filter((res) => res.statusCode === 429)).toHaveLength(2);
  });

  it('Does not allow parallel guesses past the attempt limit', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    await setKnownCode(userId);
    const guess = () => agent.post('/api/user/email/verify').send({ code: '000000' });

    // Keep guessing in parallel batches until the code locks
    let checkedGuesses = 0;
    for (let i = 0; i < 5; i++) {
      const results = await Promise.all(Array.from({ length: 10 }, guess));
      checkedGuesses += results.filter((res) => res.body.message === 'emailPreference.error.invalidCode').length;
    }

    expect(checkedGuesses).toBe(5);
    const row = await UserEmail.findOne({ user: userId });
    expect(row.attempts).toBe(5);
    const res = await agent.post('/api/user/email/verify').send({ code: '123456' });
    expect(res.body.message).toBe('emailPreference.error.codeExpired');
  });

  it('Does not save an email whose code was replaced by a newer request', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'old@example.com' });
    const oldCode = await setKnownCode(userId);

    // A newer code for a different address replaces the old one before the old code is checked
    await UserEmail.updateOne({ user: userId }).set({
      pendingEmail: 'new@example.com',
      verificationCode: sails.helpers.email.hashVerificationCode('654321'),
    });

    const res = await agent.post('/api/user/email/verify').send({ code: oldCode });
    expect(res.statusCode).toBe(400);
    const row = await UserEmail.findOne({ user: userId });
    expect(row.email).toBeNull();
    expect(row.pendingEmail).toBe('new@example.com');
  });
});
