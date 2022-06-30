const dayjs = require('dayjs');

const seasonFixtures = [
  {
    name: 'Clubs 2022',
    // startTime: 1642642200,
    startTime: dayjs('2022-01-19', 'yyyy-mm-dd').valueOf(),
    // endTime: 1674178200,
    endTime: dayjs('2023-01-18', 'yyyy-mm-dd').valueOf(),
    firstPlace: 'player1',
    secondPlace: 'player2',
    thirdPlace: 'player3',
    fourthPlace: 'player4',
    bracketLink: 'https://github.com/cuttle-cards/cuttle',
    footageLink: 'https://github.com/cuttle-cards/cuttle-assets',
  },
  {
    name: 'Diamonds 2022',
    // startTime: 1642642200,
    startTime: dayjs('2023-01-19', 'yyyy-mm-dd').valueOf(),
    // endTime: 1674178200,
    endTime: dayjs('2024-01-20', 'yyyy-mm-dd').valueOf(),
  },
];

const seaonOneMatches = [
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
    winner: 'player4',
    startTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2022-01-27', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player5',
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
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player3',
    winner: 'player1',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player1',
    player2: 'player4',
    winner: 'player4',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  // Player 2 week 1
  {
    player1: 'player2',
    player2: 'player3',
    winner: 'player3',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player2',
    player2: 'player4',
    winner: 'player2',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  // Player 3 week 1
  {
    player1: 'player3',
    player2: 'player4',
    winner: 'player3',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
  {
    player1: 'player3',
    player2: 'player5',
    winner: 'player3',
    startTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
    endTime: dayjs('2023-01-21', 'yyyy-mm-dd').valueOf(),
  },
];

const matchesFixture = [...seaonOneMatches, ...seasonTwoMatches];

export { seasonFixtures, matchesFixture };
