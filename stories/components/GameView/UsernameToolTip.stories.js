import UsernameToolTip from '@/components/GameView/UsernameToolTip';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'GameView/UsernameToolTip',
  component: UsernameToolTip,
};

const Template = (args, { argTypes }) => ({
  components: { UsernameToolTip },
  props: Object.keys(argTypes),
  template: `<UsernameToolTip v-bind="$props" />`,
});

export const UsernameToolTipStory = Template.bind({});
UsernameToolTipStory.args = {
  username: 'username',
  isPlayer: false,
};
