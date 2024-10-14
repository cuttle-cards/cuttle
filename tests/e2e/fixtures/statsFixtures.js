const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const GameStatus = require('../../../utils/GameStatus.json');

const seasonFixtures = [
  {
    name: 'Clubs 2022',
    startTime: dayjs.utc('2022-01-19 20:30').toDate(),
    // 4 weeks long, minus 2.5 hours
    endTime: dayjs.utc('2022-02-16 18:00').toDate(),
    firstPlace: 'player1',
    secondPlace: 'player2',
    thirdPlace: 'player3',
    fourthPlace: 'player4',
    bracketLink: 'https://github.com/cuttle-cards/cuttle',
    footageLink: 'https://github.com/cuttle-cards/cuttle-assets',
    gameCounts: [ 50, 80, 100, 110 ],
    uniqePlayersPerWeek: [ 10, 15, 17, 22 ],
  },
  {
    name: 'Diamonds 2022',
    startTime: dayjs.utc('2022-02-16 18:00').toDate(),
    endTime: dayjs.utc('2022-03-16 18:00').toDate(),
    gameCounts: [ 50, 80, 100, 110 ],
    uniqePlayersPerWeek: [ 10, 15, 17, 22 ],
  },
  {
    name: 'Current Season',
    startTime: dayjs.utc().subtract(2, 'week')
      .toDate(),
    endTime: dayjs.utc().add(11, 'week')
      .toDate(),
    gameCounts: [ 50, 80, 100, 110 ],
    uniqePlayersPerWeek: [ 10, 15, 17, 22 ],
  },
  {
    name: 'Future Spades Season',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  {
    name: 'World Championship Season',
    startTime: dayjs.utc().subtract(2, 'week')
      .subtract(10, 'second')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .subtract(9, 'second')
      .toDate(),
    firstPlace: 'player1',
    secondPlace: 'player2',
    thirdPlace: 'player3',
    fourthPlace: 'player4',
    bracketLink: 'https://github.com/cuttle-cards/cuttle',
    footageLink: 'https://github.com/cuttle-cards/cuttle-assets',
  },
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
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  // Player 4 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  // Player 5 week 1
  {
    player1: 'player5',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player5',
    player2: 'player4',
    winner: 'player5',
    startTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-20', 'yyyy-mm-dd').toDate(),
  },
  ////////////
  // Week 2 //
  ////////////
  // Player 1
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player5',
    winner: 'player1',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  // Player 2
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  // Player 3
  {
    player1: 'player4',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  // Player 4
  {
    player1: 'player4',
    player2: 'player5',
    winner: 'player5',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player2',
    winner: 'player2',
    startTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-01-27', 'yyyy-mm-dd').toDate(),
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
    startTime: dayjs.utc('2022-02-02', 'yyyy-mm-dd').toDate(),
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
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  // Player 3 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player3',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
    endTime: dayjs.utc('2022-02-20', 'yyyy-mm-dd').toDate(),
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
    startTime: dayjs.utc().subtract(2, 'week')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc().subtract(2, 'week')
      .add(2, 'day')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .add(2, 'day')
      .toDate(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs.utc().subtract(2, 'week')
      .add(3, 'day')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .add(3, 'day')
      .toDate(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs.utc().subtract(2, 'week')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .toDate(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs.utc().subtract(2, 'week')
      .add(1, 'day')
      .toDate(),
    endTime: dayjs.utc().subtract(2, 'week')
      .add(1, 'day')
      .toDate(),
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
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  // Player 3 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player3',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs.utc().add(1, 'year')
      .toDate(),
    endTime: dayjs.utc().add(1, 'year')
      .toDate(),
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
    updatedAt: dayjs.utc('2022-01-20').toDate(),
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
    updatedAt: dayjs.utc('2022-01-20').toDate(),
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
    updatedAt: dayjs.utc('2022-01-20').toDate(),
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
    updatedAt: dayjs.utc('2022-01-20').toDate(),
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
    updatedAt: dayjs.utc('2022-01-27').toDate(),
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
    updatedAt: dayjs.utc('2022-01-27').toDate(),
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
    updatedAt: dayjs.utc('2022-02-15').toDate(),
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
    updatedAt: dayjs.utc('2022-02-20').toDate(),
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
    updatedAt: dayjs.utc('2022-02-27').toDate(),
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
    updatedAt: dayjs.utc('2022-02-28').toDate(),
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
    updatedAt: dayjs.utc().subtract(2, 'week')
      .toDate(),
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
    updatedAt: dayjs.utc().subtract(1, 'week')
      .add(1, 'day')
      .toDate(),
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
    updatedAt: dayjs.utc().subtract(1, 'week')
      .add(2, 'day')
      .toDate(),
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
    updatedAt: dayjs.utc('2014-01-01').toDate(),
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
    updatedAt: dayjs.utc().add(3, 'year')
      .toDate(),
    p0: 'player1',
    p1: 'player2',
  },
];

const gameFixtures = [ ...seasonOneGames, ...seasonTwoGames, ...seasonFourGames, ...gamesWithoutASeason ];

const matchesFixture = [
  ...seasonOneMatches,
  ...seasonTwoMatches,
  ...seasonFourMatches,
  ...seasonThreeMatches,
];

export { seasonFixtures, matchesFixture, gameFixtures };
