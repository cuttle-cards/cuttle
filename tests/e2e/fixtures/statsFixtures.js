const dayjs = require('dayjs');
const GameStatus = require('../../../utils/GameStatus.json');

const seasonFixtures = [
  {
    name: 'Clubs 2022',
    startTime: dayjs('2022-01-19 20:30').valueOf(),
    // 4 weeks long, minus 2.5 hours
    endTime: dayjs('2022-02-16 18:00').valueOf(),
    firstPlace: 'player1',
    secondPlace: 'player2',
    thirdPlace: 'player3',
    fourthPlace: 'player4',
    bracketLink: 'https://github.com/cuttle-cards/cuttle',
    footageLink: 'https://github.com/cuttle-cards/cuttle-assets',
    gameCounts: [50, 80, 100, 110],
    uniqePlayersPerWeek:[10, 15, 17, 22],
  },
  {
    name: 'Diamonds 2022',
    startTime: dayjs('2022-02-16 18:00').valueOf(),
    endTime: dayjs('2022-03-16 18:00').valueOf(),
    gameCounts: [50, 80, 100, 110],
    uniqePlayersPerWeek:[10, 15, 17, 22],
  },
  {
    name: 'Current Season',
    startTime: dayjs().subtract(2, 'week').valueOf(),
    endTime: dayjs().add(11, 'week').valueOf(),
    gameCounts: [50, 80, 100, 110],
    uniqePlayersPerWeek:[10, 15, 17, 22],
  },
  {
    name: 'Future Spades Season',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  {
    name: 'World Championship Season',
    startTime: dayjs().subtract(2, 'week').subtract(10, 'second').valueOf(),
    endTime: dayjs().subtract(2, 'week').subtract(9, 'second').valueOf(), 
    firstPlace: 'player1',
    secondPlace: 'player2',
    thirdPlace: 'player3',
    fourthPlace: 'player4',
    bracketLink: 'https://github.com/cuttle-cards/cuttle',
    footageLink: 'https://github.com/cuttle-cards/cuttle-assets',
  }
];

const seasonOneMatches = [
  ////////////
  // Week 1 //
  ////////////
  // Player 1 week 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player1',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player1',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player2',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  // Player 4 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  // Player 5 week 1
  {
    player1: 'player5',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player5',
    player2: 'player4',
    winner: 'player5',
    startTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-20', 'yyyy-mm-dd').valueOf(),
  },
  ////////////
  // Week 2 //
  ////////////
  // Player 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player1',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player5',
    winner: 'player1',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  // Player 2
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player2',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  // Player 3
  {
    player1: 'player4',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  // Player 4
  {
    player1: 'player4',
    player2: 'player5',
    winner: 'player5',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },

  ////////////
  // Week 3 //
  ////////////
  // Player 1
  // Incomplete Match
  {
    player1: 'player1',
    player2: 'player2',
    winner: null,
    startTime: dayjs('2022-02-02', 'yyyy-mm-dd').valueOf(),
  },
];

const seasonTwoMatches = [
  ////////////
  // Week 1 //
  ////////////
  // Player 1 week 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  // Player 3 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player3',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-02-20', 'yyyy-mm-dd').valueOf(),
  },
];

const seasonFourMatches = [
  ////////////
  // Week 1 //
  ////////////
  // Player 1 week 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs().subtract(2, 'week').valueOf(),
    endTime: dayjs().subtract(2, 'week').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs().subtract(2, 'week').add(2, 'day').valueOf(),
    endTime: dayjs().subtract(2, 'week').add(2, 'day').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs().subtract(2, 'week').add(3, 'day').valueOf(),
    endTime: dayjs().subtract(2, 'week').add(3, 'day').valueOf(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs().subtract(2, 'week').valueOf(),
    endTime: dayjs().subtract(2, 'week').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs().subtract(2, 'week').add(1, 'day').valueOf(),
    endTime: dayjs().subtract(2, 'week').add(1, 'day').valueOf(),
  },
];

const seasonThreeMatches = [
  ////////////
  // Week 1 //
  ////////////
  // Player 1 week 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  // Player 3 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player3',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs().add(1, 'year').valueOf(),
    endTime: dayjs().add(1, 'year').valueOf(),
  },
];

const seasonOneGames = [
  // Week 1
  {
    name: 'Clubs Week 1, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-01-20').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  {
    name: 'Clubs Week 1, Game 2',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player2',
    updatedAt: dayjs('2022-01-20').valueOf(),
    p0: 'player2',
    p1: 'player3',
  },
  {
    name: 'Clubs Week 1, Game 3',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-01-20').valueOf(),
    p0: 'player1',
    p1: 'player3',
  },
  {
    name: 'Clubs Week 1, Game 4',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player2',
    updatedAt: dayjs('2022-01-20').valueOf(),
    p0: 'player2',
    p1: 'player3',
  },

  // Week 2
  {
    name: 'Clubs Week 2, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-01-27').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  {
    name: 'Clubs Week 2, Game 2',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player3',
    updatedAt: dayjs('2022-01-27').valueOf(),
    p0: 'player3',
    p1: 'player4',
  },
  // Week 4 games
  {
    name: 'Clubs Week 4, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player3',
    updatedAt: dayjs('2022-02-15').valueOf(),
    p0: 'player3',
    p1: 'player4',
  },
];

const seasonTwoGames = [
  // Week 1
  {
    name: 'Diamonds Week 1, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-02-20').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  // Week 2
  {
    name: 'Diamonds Week 2, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-02-27').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  {
    name: 'Diamonds Week 2, Game 2',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2022-02-28').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
];
const seasonFourGames = [
  // Week 1
  {
    name: 'Current Season Week 1, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs().subtract(2, 'week').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  // Week 2
  {
    name: 'Current Season Week 2, Game 1',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs().subtract(1, 'week').add(1, 'day').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  {
    name: 'Current Season Week 2, Game 2',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs().subtract(1, 'week').add(2, 'day').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
];

const gamesWithoutASeason = [
  {
    name: 'Game before first season',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs('2014-01-01').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
  {
    name: 'Game after last season',
    status: GameStatus.FINISHED,
    p0Ready: true,
    p1Ready: true,
    passes: 0,
    turn: 12,
    isRanked: false,
    winner: 'player1',
    updatedAt: dayjs().add(3, 'year').valueOf(),
    p0: 'player1',
    p1: 'player2',
  },
];

const gameFixtures = [...seasonOneGames, ...seasonTwoGames, ...seasonFourGames ,...gamesWithoutASeason];

const matchesFixture = [...seasonOneMatches, ...seasonTwoMatches, ...seasonFourMatches ,...seasonThreeMatches];

export { seasonFixtures, matchesFixture, gameFixtures };
