import { describe, it, expect } from 'vitest';
import nock from 'nock';
import request from 'supertest';

describe('Login with Discord oAuth', () => {
  it('Logs in with Discord oAuth', async () => {
    // Use Agent to persist cookies & session data
    const agent = request.agent(globalThis.sailsApp);

    nock('https://discord.com')
      .post('/api/oauth2/token')
      .reply(200, {
        accessToken: '123456',
        token_type: 'bearer'
      });

    nock('https://discord.com').get('/api/users/@me')
      .reply(200, {
        id: '9876564',
        username: 'totallynotthegovernment69',
      });

    const { generateSecret } = sails.helpers.oauth;
    const secret = generateSecret();

    const res = await agent
      .get('/api/user/discord/callback')
      .query({ state: secret, code: '12345' });

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('http://localhost:8080/?oauthsignup=discord');

    await agent.post('/api/user/discord/completeOauth').send({ username: 'totallynotthegovernment69' });

    const { body: status } = await agent
      .get('/api/user/status');

    expect(status.authenticated).toBe(true);
    expect(status.username).toEqual('totallynotthegovernment69');
    expect(status.id).toEqual(status.identities[0].id);
  });
});
