import AwardCard from '@/components/AwardCard';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'AwardCard',
  component: AwardCard,
};

const Template = (args, { argTypes }) => ({
  components: { AwardCard },
  props: Object.keys(argTypes),
  template: `
  <div class="d-flex justify-space-around flex-wrap">
        <award-card v-bind="$props" class="mb-4" />
        <award-card username="Second Place Player" :place="2" class="mb-4" />
        <award-card username="Third Place Player" :place="3" class="mb-4" />
      </div>
  `,
  computed: {
    // TODO: Make this more global in the app (and in storybook)
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
});

export const AwardCardStory = Template.bind({});
AwardCardStory.args = {
  username: 'Champion player',
  place: 1,
};
