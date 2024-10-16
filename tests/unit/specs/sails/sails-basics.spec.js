import { beforeEach, describe, expect, it } from 'vitest';

describe('Sails basics', () => {

  beforeEach(async () => {
    await sails.helpers.wipeDatabase();
  });

  it('should read from and write to the db', async () => {
    let users = await User.find();
    expect(users.length).toBe(0);
    await User.create({ username: 'foo', encryptedPassword: 'xyz123ABCABK7KAL' });

    users = await User.find({});
    expect(users.length).toBe(1);
  });

  it('should execute sails helpers', async () => {
    const serverIsUp = await sails.helpers.getApiHealth();
    expect(serverIsUp).toBe(true);
  });
});
