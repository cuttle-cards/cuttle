import { beforeAll, afterAll } from 'vitest';
import { bootServer, shutDownServer } from './util/server.util';

let sailsApp;

beforeAll(async () => {
  sailsApp = await bootServer();
});

afterAll(async () => {
  await shutDownServer(sailsApp);
});
