<template>
  <div>
    <v-tooltip :top="isPlayer" :bottom="!isPlayer">
      <template #activator="{ on, attrs }">
        <h4 :data-cy="dataCyProp" v-bind="attrs" v-on="on">{{ formattedUsername }}</h4>
      </template>
      <span>{{ username }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: 'UsernameToolTip',
  props: {
    username: {
      required: true,
      type: String,
    },
    isPlayer: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    dataCyProp() {
      return this.isPlayer ? 'player-username' : 'opponent-username';
    },
    formattedUsername() {
      return this.username.length < 13 ? this.username : `${this.username.slice(0, 12)}...`;
    },
  },
};
</script>

<style lang="scss" scoped></style>
