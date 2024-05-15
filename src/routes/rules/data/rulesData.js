import ScuttleSuitOrder from '../components/ScuttleSuitOrder.vue';

const rules = [
    {
      title: 'rules.draw',
      icon: 'cards-playing-spade-multiple',
      description: 'rules.drawDescription',
      staticImg: '/img/rulesView/rules_action_draw.svg',
    },
    {
      title: 'rules.points',
      icon: 'numeric',
      description: 'rules.pointsDescription',
      staticImg: '/img/rulesView/rules_action_points.svg',
    },
    {
      title: 'rules.scuttle',
      icon: 'skull-crossbones',
      description: 'rules.scuttleDescription',
      staticImg: '/img/rulesView/rules_action_skull.svg',
      childComponent: ScuttleSuitOrder,
    },
    {
      title: 'rules.royal',
      icon: 'crown',
      description: 'rules.royalDescription',
      staticImg: '/img/rulesView/rules_action_royals.svg',
    },
    {
      title: 'rules.oneoff',
      icon: 'delete',
      description: 'rules.oneoffDescription',
      staticImg: '/img/rulesView/rules_action_oneoffs.svg',
    },
];

const royals = [
  {
    title: 'rules.royals.king',
    icon: 'crown',
    description: 'rules.royals.kingDescription',
    staticImg: '/img/rulesView/royals_king.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/king.gif?raw=true',
  },
  {
    title: 'rules.royals.queen',
    icon: 'crown',
    description: 'rules.royals.queenDescription',
    staticImg: '/img/rulesView/royals_queen.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/queen.gif?raw=true',
  },
  {
    title: 'rules.royals.jack',
    icon: 'crown',
    description: 'rules.royals.jackDescription',
    staticImg: '/img/rulesView/royals_jack.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/jack.gif?raw=true',
  },
];
const oneOffs = [
  {
    title: 'rules.oneoffs.ace',
    icon: 'delete',
    description: 'rules.oneoffs.aceDescription',
    staticImg: '/img/rulesView/oneoffs_ace.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/ace.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.two',
    icon: 'delete',
    description: 'rules.oneoffs.twoE1Description',
    description2: 'rules.oneoffs.twoE2Description',
    staticImg: '/img/rulesView/oneoffs_two.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/counter.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.three',
    icon: 'delete',
    description: 'rules.oneoffs.threeDescription',
    staticImg: '/img/rulesView/oneoffs_three.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/three.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.four',
    icon: 'delete',
    description: 'rules.oneoffs.fourDescription',
    staticImg: '/img/rulesView/oneoffs_four.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/four.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.five',
    icon: 'delete',
    description: 'rules.oneoffs.fiveDescription',
    staticImg: '/img/rulesView/oneoffs_five.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/five.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.six',
    icon: 'delete',
    description: 'rules.oneoffs.sixDescription',
    staticImg: '/img/rulesView/oneoffs_six.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/six.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.seven',
    icon: 'delete',
    description: 'rules.oneoffs.sevenDescription',
    staticImg: '/img/rulesView/oneoffs_seven.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.eight',
    icon: 'delete',
    description: 'rules.oneoffs.eightDescription',
    staticImg: '/img/rulesView/oneoffs_eight.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/seven.gif?raw=true',
  },
  {
    title: 'rules.oneoffs.nine',
    icon: 'delete',
    description: 'rules.oneoffs.nineDescription',
    staticImg: '/img/rulesView/oneoffs_nine.svg',
    animatedImg: 'https://github.com/cuttle-cards/cuttle-assets/blob/main/assets/nine.gif?raw=true',
  },
];

const sectionTitle = [
  { id: 'introduction',title: 'rules.introduction', href: '#introduction' },
  { id:'howtoplay',title: 'rules.howToPlay', href: '#howtoplay' },
  { id:'royals',title: 'rules.royals.title', href: '#royals' },
  { id:'oneoffs',title: 'rules.oneoffs.title', href: '#oneoffs' },
  { id:'faq',title: 'rules.faq.title', href: '#faq' },
  { id: 'tournaments',title: 'rules.tournaments.title', href: '#tournaments' },
];

export { rules,  oneOffs, royals, sectionTitle };