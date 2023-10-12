import AwardCard from '@/components/AwardCard.vue';

export default {
  title: 'AwardCard',
  component: AwardCard,
};

const getComponent = (args) => ({
  components: { AwardCard },
  setup() {
    return { args };
  },
  template: `
    <div class="d-flex justify-space-around flex-wrap">
      <AwardCard
        v-bind="args"
        class="mb-4"
      />
    </div>
  `,
  computed: {
    // TODO: Make this more global in the app (and in storybook)
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
});

export const First = {
  render: getComponent,
  args: {
    username: 'username',
    place: 1,
  },
};

export const Second = {
  render: getComponent,
  args: {
    username: 'username',
    place: 2,
  },
};

export const Third = {
  render: getComponent,
  args: {
    username: 'username',
    place: 3,
  },
};

export const Default = {
  render: getComponent,
  args: {
    username: 'username',
    place: 4,
  },
};
