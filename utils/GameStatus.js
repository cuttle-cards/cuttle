const GameStatus = {
  CREATED : 1,
  STARTED : 2,
  FINISHED : 3,
  ARCHIVED : 4
};

// CommonJS fallback
if (typeof module !== 'undefined') {
  module.exports = GameStatus;
}
export default GameStatus;
