import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import nock from 'nock';
import request from 'supertest';

const googleCallback = async(agent, prevIdentity = false) => {
  const location = prevIdentity ? 'http://localhost:8080/': 'http://localhost:8080/?oauthsignup=google';

  const { generateSecret } = sails.helpers.oauth;
  const secret = generateSecret();

  const res = await agent
    .get('/api/user/google/callback')
    .query({ state: secret, code: '12345' });

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(location);
};

describe('Login with Google oAuth', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();

    // Mock request made to google
    nock('https://oauth2.googleapis.com')
      .post('/token')
      .reply(200, {
        access_token: '123456',
        token_type: 'bearer'
      })
      .persist();

    nock('https://www.googleapis.com').get('/oauth2/v2/userinfo')
      .reply(200, {
        id: '9876564',
        email: 'test@example.com',
      })
      .persist();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it('Creates new account with Google oAuth', async () => {
    // Use Agent to persist cookies & session data
    const agent = request.agent(globalThis.sailsApp);

    await googleCallback(agent);

    await agent.post('/api/user/google/completeoauthregistration').send({ username: 'test@example.com' });

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('test@example.com');
    expect(status.id).toEqual(status.identities[0].id);
  });

  it('Logs in with Google oAuth', async () => {
    // Use Agent to persist cookies & session data
    const agent = request.agent(globalThis.sailsApp);

    await googleCallback(agent);

    await agent.post('/api/user/google/completeoauthregistration').send({ username: 'test@example.com' });
    await agent.post('/api/user/logout');

    await googleCallback(agent, true);

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('test@example.com');
    expect(status.id).toEqual(status.identities[0].id);
  });

  it('Logs into existing account with Google oAuth', async () => {
    const agent = request.agent(globalThis.sailsApp);
    const userRes = await agent.post('/api/user/signup').send({ username: 'test@example.com', password: 'notagoodpassword' });

    expect(userRes.statusCode).toBe(200);
    expect(userRes.body).toBeGreaterThan(0);

    await agent.post('/api/user/logout');

    await googleCallback(agent);

    await agent.post('/api/user/google/completeoauthregistration').send({ username: 'test@example.com', password: 'notagoodpassword' });

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('test@example.com');
    expect(status.id).toEqual(userRes.body);
  });

  it('Links google to a logged in account', async () => {
    const agent = request.agent(globalThis.sailsApp);
    const userRes = await agent.post('/api/user/signup').send({ username: 'test@example.com', password: 'notagoodpassword' });
    expect(userRes.statusCode).toBe(200);
    expect(userRes.body).toBeGreaterThan(0);

    await googleCallback(agent, true);

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('test@example.com');
    expect(status.id).toEqual(userRes.body);
    expect(status.id).toEqual(status.identities[0].id);
  });
});
