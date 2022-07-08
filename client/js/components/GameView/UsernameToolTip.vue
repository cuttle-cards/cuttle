<template>
  <div>
    <div class="username-container__outer" :class="{ 'username-container__outer--rtl': !isPlayer }">
      <div class="username-container">
        <h4 class="truncate" :data-cy="dataCyProp">{{ username }}</h4>
      </div>
    </div>
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
  },
};
</script>

<style lang="scss" scoped>
.username-container {
  /* Change this to see truncation */
  background-color: transparent;
  padding: 1em;
  transition: 0.25s all ease-in-out;
  white-space: nowrap;

  &__outer {
    width: auto;
  }

  &__outer--rtl {
    direction: rtl;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
    width: fit-content;
  }
}
.truncate {
  margin: 0;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  transition: 0.25s all ease-in-out;

  .username-container:hover & {
    width: fit-content;
  }
}
</style>
