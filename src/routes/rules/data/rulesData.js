import ScuttleSuitOrder from '../components/ScuttleSuitOrder.vue';

const rules = [
  {
    title: 'rules.draw',
    description: 'rules.drawDescription',
    staticImg: '/img/rulesView/rules_action_draw.svg',
  },
  {
    title: 'rules.points',
    description: 'rules.pointsDescription',
    staticImg: '/img/rulesView/rules_action_points.svg',
  },
  {
    title: 'rules.scuttle',
    description: 'rules.scuttleDescription',
    staticImg: '/img/rulesView/rules_action_skull.svg',
    childComponent: ScuttleSuitOrder,
  },
  {
    title: 'rules.royal',
    description: 'rules.royalDescription',
    staticImg: '/img/rulesView/rules_action_royals.svg',
  },
  {
    title: 'rules.oneoff',
    description: 'rules.oneoffDescription',
    staticImg: '/img/rulesView/rules_action_oneoffs.svg',
  },
];

const royals = [
  {
    title: 'rules.royals.king',
    description: 'rules.royals.kingDescription',
    staticImg: '/img/rulesView/royals_king.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
  },
  {
    title: 'rules.royals.queen',
    description: 'rules.royals.queenDescription',
    description2: 'rules.royals.queenDescription2',
    staticImg: '/img/rulesView/royals_queen.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/queen.gif?raw=true',
  },
  {
    title: 'rules.royals.jack',
    description: 'rules.royals.jackDescription',
    staticImg: '/img/rulesView/royals_jack.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/jack.gif?raw=true',
  },
  {
    title: 'rules.royals.eight',
    description: 'rules.royals.eightDescription',
    staticImg: '/img/rulesView/royals_eight.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/glasses.gif?raw=true',
  },
];

const oneOffs = [
  {
    title: 'rules.oneoffs.ace',
    description: 'rules.oneoffs.aceDescription',
    staticImg: '/img/rulesView/oneoffs_ace.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/ace.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.two',
    description: 'rules.oneoffs.twoE1Description',
    description2: 'rules.oneoffs.twoE2Description',
    staticImg: '/img/rulesView/oneoffs_two.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/counter.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.three',
    description: 'rules.oneoffs.threeDescription',
    staticImg: '/img/rulesView/oneoffs_three.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/three.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.four',
    description: 'rules.oneoffs.fourDescription',
    staticImg: '/img/rulesView/oneoffs_four.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/four.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.five',
    description: 'rules.oneoffs.fiveDescription',
    staticImg: '/img/rulesView/oneoffs_five.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/five.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.six',
    description: 'rules.oneoffs.sixDescription',
    staticImg: '/img/rulesView/oneoffs_six.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.seven',
    description: 'rules.oneoffs.sevenDescription',
    staticImg: '/img/rulesView/oneoffs_seven.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.nine',
    description: 'rules.oneoffs.nineDescription',
    staticImg: '/img/rulesView/oneoffs_nine.png',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/nine.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.ten',
    description: 'rules.oneoffs.tenDescription',
    staticImg: '/img/rulesView/oneoffs_ten.png',
  },
];

const multiplayer = {
  '3Players': {
    title: 'rules.3Players.title',
    text: 'rules.3Players.text',
    rulesDifference: 'rules.3Players.rules',
    rules: [ 'rules.3Players.rule1', 'rules.3Players.rule2', 'rules.3Players.rule3', 'rules.3Players.rule4' ],
  },
  '4Players': {
    title: 'rules.4Players.title',
    text: 'rules.4Players.text',
    rulesDifference: 'rules.4Players.rules',
    rules: [
      'rules.4Players.rule1',
      'rules.4Players.rule2',
      'rules.4Players.rule3',
      'rules.4Players.rule4',
      'rules.4Players.rule5',
    ],
  },
};

const faq = [
  'twoCounter',
  'queenProtectTwo',
  'queenProtectScuttle',
  'twoOnTwo',
  'kingWin',
  'aceDestruction',
  'revealNoPoints',
  'revealOneLeft',
  'emptyHandFive',
  'deckExhaust',
  'whereToPlay',
];

const sectionTitles = [
  { id: 'introduction', title: 'rules.introduction', href: '#introduction' },
  { id:'howtoplay', title: 'rules.howToPlay', href: '#howtoplay' },
  { id:'actions', title: 'rules.actions.title', href: '#actions' },
  { id:'royals', title: 'rules.royals.title', href: '#royals' },
  { id:'oneoffs', title: 'rules.oneoffs.title', href: '#oneoffs' },
  { id: 'multiplayer', title: 'rules.multiplayerTitle', href: '#multiplayer' },
  { id:'faq', title: 'rules.faq.title', href: '#faq' },
  { id: 'tournaments', title: 'rules.tournaments.title', href: '#tournaments' },
];

export { rules,  oneOffs, royals, faq, sectionTitles, multiplayer };
