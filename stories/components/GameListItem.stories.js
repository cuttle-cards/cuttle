import GameListItem from '@/components/GameListItem';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'GameListItem',
  component: GameListItem,
};

const Template = (args, { argTypes }) => ({
  components: { GameListItem },
  props: Object.keys(argTypes),
  template: `
  <div class="d-flex justify-space-around flex-wrap">
    <game-list-item v-bind="$props" class="mb-4" />
  </div>
  `,
  computed: {
    // TODO: Make this more global in the app (and in storybook)
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
});

export const Default = Template.bind({});
Default.args = {
  name: 'Play some Cuttle!',
  isRanked: true,
  p0ready: true,
  p1Ready: false,
  numPlayers: 1,
  gameId: 7,
  status: true,
};
