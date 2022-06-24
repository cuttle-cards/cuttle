<template>
  <v-dialog v-model="show">
    <!-- Activator -->
    <template #activator="{on, attrs}">
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
          Competitive Cuttle is divided into 4 seasons per year, one per suit: Clubs, Diamonds,
          Hearts, and Spades. At the end of each season, the top 4 players play a double
          elimination championship tournament and the
          <strong>champions are permenantly accoladed on the site.</strong>
        </p>
        <p>
          Each Season is divided into 13 weeks. For each week, we count the number of best 2/3
          ranked matches each player wins against unique opponents and assign players points 
          based on their weekly standing.
        </p>
        <v-list>
          <v-list-item>
            <v-icon color="#AF9500" class="mr-2">mdi-medal</v-icon>
            The player with the most wins gets 5 points for the week
          </v-list-item>
          <v-list-item>
            <v-icon color="#B4B4B4" class="mr-2">mdi-medal</v-icon>
            The player with the 2nd most wins gets 4 points for the week
          </v-list-item>
          <v-list-item>
            <v-icon color="#6A3805" class="mr-2">mdi-medal</v-icon>
            The player with the 3rd most wins gets 3 points for the week
          </v-list-item>
          <v-list-item>
            Each other player who won at least one match gets 1 point for the week
          </v-list-item>
          <v-card-actions class="d-flex justify-end">
            <v-btn outlined color="primary" @click="show = false"> Got It! </v-btn>
          </v-card-actions>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RulesDialog',
  data() {
    return {
      show: false,
    };
  },
};
</script>
