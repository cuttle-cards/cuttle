type Game = unknown;
type Card = unknown;
type Hand = Card[];

export type UserModelAttrs = {
  username: string;
  encryptedPassword: string;
  game?: Game;
  pNum?: 0 | 1;
  hand?: Hand;
  points?: Card[];
  faceCards?: Card[];
  frozenId?: Card;
  rank?: number;
};

export type User = Sails.Model<UserModelAttrs>;
