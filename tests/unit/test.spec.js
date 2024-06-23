import { it, expect } from 'vitest';

it('should read from and write to the db', async () => {
  let users = await User.find();
  expect(users.length).toBe(0);
  const newUser = await User.create({username: 'foo', encryptedPassword: 'butts'});

  users = await User.find({});
  expect(users.length).toBe(1);
});

it('should execute sails helpers', async () => {
  const serverIsUp = await sails.helpers.getApiHealth();
  expect(serverIsUp).toBe(true);
});