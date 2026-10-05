import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

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
    const res = await request(globalThis.sailsApp).get('/api/user/email');
    expect(res.statusCode).toBe(401);
  });

  it('Returns no email for a new user', async () => {
    const { agent } = await signup('myUser');
    const { body } = await agent.get('/api/user/email');
    expect(body).toEqual({ email: null, promotional: false });
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

    const { body } = await agent.get('/api/user/email');
    expect(body).toEqual({ email: 'me@example.com', promotional: true });

    const verified = await UserEmail.findOne({ user: userId });
    expect(verified.pendingEmail).toBeNull();
    expect(verified.verificationCode).toBeNull();
  });

  it('Keeps one row per user', async () => {
    const { agent, userId } = await signup('myUser');
    await agent.post('/api/user/email/request-code').send({ email: 'first@example.com' });
    await UserEmail.updateOne({ user: userId }).set({ codeSentAt: new Date(0) });
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
    await UserEmail.updateOne({ user: userId }).set({ codeExpiresAt: new Date(Date.now() - 1000) });

    const res = await agent.post('/api/user/email/verify').send({ code });
    expect(res.body.message).toBe('emailPreference.error.codeExpired');
  });

  it('Does not allow an email verified by another user', async () => {
    const { agent: firstAgent, userId: firstId } = await signup('firstUser');
    await firstAgent.post('/api/user/email/request-code').send({ email: 'me@example.com' });
    await firstAgent.post('/api/user/email/verify').send({ code: await setKnownCode(firstId) });

    const { agent: secondAgent } = await signup('secondUser');
    const res = await secondAgent.post('/api/user/email/request-code').send({ email: 'ME@example.com' });
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
});
