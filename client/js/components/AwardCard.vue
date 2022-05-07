<template>
  <v-card class="d-flex">
    <div>
      <v-icon x-large>
        mdi-medal
      </v-icon>
    </div>
    <h3>
      {{ username }}
    </h3>
    {{ placeText }}
  </v-card>
</template>

<script>
export default {
  name: 'AwardCard',
  props: {
    username: String,
    placeText: String,
  },
};
</script>
