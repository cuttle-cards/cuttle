import { describe, it, expect, beforeEach } from 'vitest';
import nock from 'nock';
import request from 'supertest';

// Setup mock responses from outside requests

const discordCallback = async(agent, prevIdentity = false) => {
  const location = prevIdentity ? 'http://localhost:8080/': 'http://localhost:8080/?oauthsignup=discord';

  const { generateSecret } = sails.helpers.oauth;
  const secret = generateSecret();

  const res = await agent
    .get('/api/user/discord/callback')
    .query({ state: secret, code: '12345' });

  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe(location);
};

describe('Login with Discord oAuth', () => {
  beforeEach(async () => {
    await sails.helpers.wipeDatabase();

    nock('https://discord.com')
      .post('/api/oauth2/token')
      .reply(200, {
        access_token: '123456',
        token_type: 'bearer'
      })
      .persist();

    nock('https://discord.com').get('/api/users/@me')
      .reply(200, {
        id: '9876564',
        username: 'totallynotthegovernment69',
      })
      .persist();
  });

  it('Creates new account with Discord oAuth', async () => {
    // Use Agent to persist cookies & session data
    const agent = request.agent(globalThis.sailsApp);

    await discordCallback(agent);

    await agent.post('/api/user/discord/completeOauth').send({ username: 'totallynotthegovernment69' });

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('totallynotthegovernment69');
    expect(status.id).toEqual(status.identities[0].id);
  });

  it('Logs into existing account with Discord oAuth', async () => {
    const agent = request.agent(globalThis.sailsApp);
    const userRes = await agent.post('/api/user/signup').send({ username: 'totallynotthegovernment69', password: 'notagoodpassword' });

    expect(userRes.statusCode).toBe(200);
    expect(userRes.body).toBeGreaterThan(0);

    await agent.post('/api/user/logout');

    await discordCallback(agent);

    await agent.post('/api/user/discord/completeOauth').send({ username: 'totallynotthegovernment69', password: 'notagoodpassword' });

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('totallynotthegovernment69');
    expect(status.id).toEqual(userRes.body);
  });

  it('Links discord to a logged in account', async () => {
    const agent = request.agent(globalThis.sailsApp);
    const userRes = await agent.post('/api/user/signup').send({ username: 'totallynotthegovernment69', password: 'notagoodpassword' });
    expect(userRes.statusCode).toBe(200);
    expect(userRes.body).toBeGreaterThan(0);

    await discordCallback(agent, true);

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('totallynotthegovernment69');
    expect(status.id).toEqual(userRes.body);
    expect(status.id).toEqual(status.identities[0].id);
  });
});
