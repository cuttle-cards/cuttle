<template>
  <v-dialog v-model="show">
    <template #activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <slot name="activator">
          <v-btn id="rules-button" color="primary" outlined :small="$vuetify.breakpoint.mdAndDown">
            Rules
          </v-btn>
        </slot>
      </span>
    </template>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h1>Rules of Cuttle</h1>
        <v-btn icon @click="show = false">
          <v-icon large> mdi-close </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <h2>Game Rules</h2>
        <section>
          <h3>Players and Cards</h3>
          <p>Cuttle is a 2-player card game, played with a standard 52 card deck, without jokers.</p>
        </section>
        <section>
          <h3>Goal</h3>
          <p>
            The goal is to be the first player to have 21 <strong>or more</strong> points. When a player has
            21 or more points, they win immediately and the game is over.
          </p>
        </section>
        <section>
          <h3>Setting Up</h3>
          <p>
            Each player starts on one side of the game board and is dealt a hand from the deck. One player is
            dealt six cards; the other is dealt 5 and goes first. A *scrap pile* area is designated for
            destroyed cards.
          </p>
        </section>
        <section>
          <h3>Playing</h3>
          <p>On your turn you must make exactly one of the following moves below.</p>
        </section>
        <section>
          <h3>Moves</h3>
          <h4>1. Draw</h4>
          <p>
            You may draw one card from the deck and put it in your hand. If the deck is empty, you may pass.
            If three consecutive turns end with a pass, the game is a draw.
          </p>
          * Click the deck to draw a card

          <h4>2. Points</h4>
          <p>
            You may play any number card, Ace-Ten for the number of points shown on the card (Ace is one
            point). The first player to have 21 <strong>or more</strong> points wins.
          </p>
          * To play a card for points, click a card in your hand to select it, then click your field.`

          <h4>3. Scuttling</h4>
          <p>
            You may player a number card from your hand onto a lower valued number card that your opponent has
            played for points; this destroys both cards. You may also scuttle a card of the same rank, if your
            card has the higher suit. The suit order is Clubs (weakest) &lt; Diamonds &lt; Hearts &lt; Spades
            (strongest).
          </p>
          * To scuttle an opponent's point card, click a higher number card (Ace - Ten) in your hand to select
          it, then click the card you'd like to scuttle.

          <h4>4. Face Cards and Glasses Eights</h4>
          <p>
            Face cards and eights can be played as Face Cards and Glasses Eights. While on your board, Face
            Cards and Glasses Eights provide you advantages. An explanation of the different Face Cards and
            Glasses Eights can be found below.
          </p>
          * To play a Face Card or Glasses Eight, click the card in your hand to select it, then click your
          field (in green) to play it.

          <h4>5. One-Offs</h4>
          <p>
            Ace-Sevens and also Nines can be played as One-Offs. Playing a card for a One-Off effect discards
            (to the scrap pile) in exchange for an effect, based on the rank of the card. A list of all the
            effects can be found below.
          </p>
          * To play a card as a <strong>One-Off</strong>, click a card in your hand to select it, then click
          the Scrap Pile or an opponent's card to target.
        </section>

        <section>
          <h3>One-Off Effects</h3>
          <p><strong>Ace:</strong> destroy all point cards</p>
          <p><strong>Two:</strong> choose one of the following two effects:</p>
          <div>
            <ol>
              <li>Destroy target Face Card or Glasses Eight</li>
              <li>
                Counter target One-Off (play this when an opponent plays a One-Off effect to stop it from
                happening)
              </li>
            </ol>
          </div>
          <p><strong>Three:</strong> choose one card from the scrap pile and add it to your hand</p>
          <p><strong>Four:</strong> your opponent discards two cards</p>
          <p><strong>Five:</strong> draw two cards</p>
          <p><strong>Six:</strong> destroy all face cards and glasses eights</p>
          <p>
            <strong>Seven:</strong>
            Reveal the top two cards from the Deck and choose one of them to play immediately. Play this card
            however you would like. The other card is placed back on top of the deck.
          </p>
          <p>
            <strong>Nine</strong>: Return an opponent's card on the board to their hand . It can't be played
            next turn.
          </p>
        </section>

        <section>
          <h3>Face Cards & Glasses Eights</h3>
          <p>
            <strong>Eight:</strong> While you control a Glasses Eight, your opponent plays with an open hand
            (revealed to you). Unlike One-Offs, Glasses Eights remain in play until destroyed. * When playing
            an eight to your field, you will be prompted to choose to play it for Glasses or Points.
          </p>
          <p>
            <strong>Jack:</strong> Play a jack on top of a Point Card to move it to your side of the board.
            You keep control of the point card as long as you control the top jack.
          </p>
          <p>
            <strong>Queen:</strong> While you control a Queen, your other cards cannot be targeted by your
            opponent's cards. This effectively protects your other cards from the effects of 2's (<strong
              >including countering</strong
            >), 9's and Jacks. Note that Queens do not protect against Scuttling.
          </p>
          <p>
            <strong>King:</strong> While you have a King, the minimum points needed to win is reduced. Each
            additional King further reduces the limit.
          </p>
          <div>
            <ol>
              <li>No Kings: 21 points to win (default)</li>
              <li>1 King: 14 points to win</li>
              <li>2 Kings: 10 points to win</li>
              <li>3 Kings: 7 points to win</li>
              <li>4 Kings: 5 points to win</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>FAQ</h2>
          <h4>
            Can I play a two to counter a point card? What about a scuttle? Can I play a two to destroy my
            opponent's Face Card or Glasses Eight on their turn?
          </h4>
          <p>
            Nope! Twos can only counter One-Offs. You can play a two to destroy a Face Card or Glasses Eight,
            but this takes your turn, unlike countering.
          </p>

          <h4>Do Queens protect against countering with a two?</h4>
          <p>
            Yes! Queens protect against targeting, when a card applies a unique effect to one specific card.
            This means your other cards (not the Queen, herself) are protected against Twos (either effect),
            Nines, and Jacks.
          </p>

          <h4>Can I counter a Two with a Two?</h4>
          <p>
            Heck yeah! Playing a Two to counter is a One-Off, which can be countered with a two. Stacked
            counters make for exciting plays.
          </p>

          <h4>Can I win by playing a King?</h4>
          <p>
            Yes. If you meet the required number of points, you win immediately. This means if you play a King
            when you already have enough points to meet the new limit, you win on that turn.
          </p>

          <h4>If I play an Ace or a Six, are my cards destroyed as well?</h4>
          <p>
            Yes. Aces and Sixes destroy all Point Cards and all Face Cards plus Glasses Eights, respectively.
            That includes any that you have out. Try to avoid destroying many of your own cards!
          </p>

          <h4>Where can I play Cuttle?</h4>
          <p>
            You can play Cuttle anywhere you have a deck of cards and a friend! If you want to play online,
            there is only one place:
            <a href="https://www.cuttle.cards" target="_blank">www.cuttle.cards</a>
          </p>
        </section>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn outlined color="primary" @click="show = false"> Got It! </v-btn>
      </v-card-actions>
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
<style lang="scss" scoped>
#rules-button {
  width: 100%;
}
</style>
