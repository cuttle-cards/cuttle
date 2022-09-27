<template>
  <v-dialog v-model="show">
    <!-- Activator -->
    <template #activator="{ on, attrs }">
      <v-btn color="primary" text class="mb-2" v-bind="attrs" v-on="on">
        How are ranks determined?
        <v-icon class="ml-1">mdi-information-outline</v-icon>
      </v-btn>
    </template>
    <!-- Dialog -->
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h1>Ranked Scoring</h1>
        <v-btn icon @click="show = false">
          <v-icon large>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <p>
          Competitive Cuttle is divided into 4 seasons per year, one per suit: Clubs, Diamonds, Hearts, and
          Spades. At the end of each season, the top 4 players play a double elimination championship
          tournament and the
          <strong>champions are permenantly accoladed on the site.</strong>
        </p>
        <div class="d-flex justify-space-around flex-wrap">
          <award-card username="Champion player" :place="1" class="mb-4" />
          <award-card username="Second Place Player" :place="2" class="mb-4" />
          <award-card username="Third Place Player" :place="3" class="mb-4" />
        </div>
        <p>
          Each Season is divided into 13 weeks. For each week, we count the number of best 2/3 ranked matches
          each player wins against unique opponents (ignoring stalemates) and assign players points based on
          their weekly standing.
        </p>
        <v-list>
          <v-list-item>
            <v-icon :color="theme.firstPlace" class="mr-2">mdi-medal</v-icon>
            The player with the most wins gets 5 points for the week
          </v-list-item>
          <v-list-item>
            <v-icon :color="theme.secondPlace" class="mr-2">mdi-medal</v-icon>
            The player with the 2nd most wins gets 4 points for the week
          </v-list-item>
          <v-list-item>
            <v-icon :color="theme.thirdPlace" class="mr-2">mdi-medal</v-icon>
            The player with the 3rd most wins gets 3 points for the week
          </v-list-item>
          <v-list-item> Each other player who won at least one match gets 1 point for the week </v-list-item>
        </v-list>
        <p>
          You can view the statistics and rankings for each season on this page. At the end of each season,
          the top 4 players compete in a double elimination championship tournament. Do you have what it takes
          to become
          <strong> Lord of the Deep? </strong>
        </p>
        <!-- Actions -->
        <v-card-actions class="d-flex justify-end">
          <v-btn outlined color="primary" @click="show = false"> Got It! </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import AwardCard from '@/components/AwardCard.vue';

export default {
  name: 'RulesDialog',
  components: {
    AwardCard,
  },
  data() {
    return {
      show: false,
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.themes.light;
    },
  },
};
</script>
