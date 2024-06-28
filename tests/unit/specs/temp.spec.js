import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { bootServer, shutDownServer } from '../util/server.util';

describe('Second file', () => {

  let sailsApp;

  beforeAll(async () => {
    sailsApp = await bootServer();
  });

  afterAll(async () => {
    await shutDownServer(sailsApp);
  });

  it('Should pass', async () => {
    expect(true).toBe(true);
    const serverIsUp = await sails.helpers.getApiHealth();
    expect(serverIsUp).toBe(true);
  });
});