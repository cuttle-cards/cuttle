<template>
  <div>
    <div class="username__outer" :class="{ 'username__outer--rtl': !isPlayer }">
      <div class="username">
        <h4 class="username__text" :data-cy="dataCyProp">{{ username }}</h4>
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
.username {
  /* Change this to see truncation */
  background-color: transparent;
  padding: 1em;
  transition: 0.25s all ease-in-out;
  white-space: nowrap;

  &__outer {
    width: auto;

    &--rtl {
      direction: rtl;
    }
  }

  &__text {
    margin: 0;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    transition: 0.25s all ease-in-out;

    .username:hover & {
      width: fit-content;
    }
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
    width: fit-content;
  }
}
</style>
