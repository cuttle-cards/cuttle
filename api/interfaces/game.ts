export type GameModelAttrs = {
  name: string;
  status: boolean;
};

export type Game = Sails.Model<GameModelAttrs>;
