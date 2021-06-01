# Cuttle
This repository is the **back end** web server for [Cuttle](https://www.pagat.com/combat/cuttle.html), the pvp card game, built with SailsJs. It must be run in tandem with the [front end web server](https://github.com/itsalaidbacklife/cuttle-front-vue), built with Vue and Vuetify.

To play the game you will need to boot both the front & back end servers, then navigate to `localhost:8080` in your browser of choice.
## Project setup
### Download nodeJs
[nodeJs](https://nodejs.org/en/) lets you create & run web servers in javascript (along with other fancy system-level stuff not needed for this project). Both this repository & the [front end](https://github.com/itsalaidbacklife/cuttle-front-vue) depend on node as the main system-wide dependency. The download comes with npm (node package manageer) which you'll use to install the project-specific dependencies.

**You should install version 14.xx.xx** (Left-side download) as this is the latest **stable** version.

**NOTE** When running on your local computer, signup/login only stores credentials on your computer and in memory. Shutting down the server wipes the in-memory database along with all game & account data.

### Back End Setup
#### Download Back-End Code
##### Using git
```
git clone https://github.com/TeasingSisyphus/cuttleV2
```
##### Or [Download](https://github.com/TeasingSisyphus/cuttleV2/archive/refs/heads/main.zip) as .zip
#### Install Back-End Dependencies
cd into root folder of back-end and run
```
npm install
```
#### Boot Back-End server
```
npm start
```

### Front End Setup
#### Download Front-End Code
##### Using git
```
git clone https://github.com/itsalaidbacklife/cuttle-front-vue
```
##### Or [Download](https://github.com/itsalaidbacklife/cuttle-front-vue/archive/refs/heads/main.zip) as .zip

#### Install Front-End Dependencies
Open a terminal in the root directory of the front end project and run
```
npm install
```

#### Boot Front-End server
```
npm run serve
```

#### Open in broswer
Navigate to [localhost:8080](http:localhost:8080) in your browser of choice.

### Shutting down
You can shut down the servers by hitting `ctrl + c` several times from the terminal windows they are running in. Shut down both servers to completely delete all game & account data.

## Game Rules
### Players and Cards
Cuttle is a 2-player card game, played with a standard 52 card deck, without jokers.

### Goal
The goal is to be the first player to have 21 **or more** points. When a player has 21 or more points, they win immediately and the game is over.

### Setting Up
Each player starts on one side of the game board and is dealt a hand from the deck. One player is dealt six cards; the other is dealt 5 and goes first. A *scrap pile* area is designated for destroyed cards.

### Playing
On your turn you must make exactly one of the following moves below.

### Moves
1. **Draw:**
You may draw one card from the deck and put it in your hand. If the deck is empty, you may pass. If three consecutive turns end with a pass, the game is a draw.
	* Click the deck to draw a card

2. **Points:**
You may play any number card, Ace-Ten for the number of points shown on the card (Ace is one point). The first player to have 21 **or more** points wins.

	* To play a card for points, click a card in your hand to select it, then click your field.

3. **Scuttling:**
You may player a number card from your hand onto a lower valued number card that your opponent has played for points; this destroys both cards. You may also scuttle a card of the same rank, if your card has the higher suit. The suit order is Clubs (weakest) < Diamonds < Hearts < Spades (strongest).

	* To scuttle an opponent's point card, click a higher number card (Ace - Ten) in your hand to select it, then click the card you'd like to scuttle.

4. **Face Cards and Glasses Eights:**
Face cards and eights can be played as **Face Cards and Glasses Eights**. While on your board, Face Cards and Glasses Eights provide you advantages. An explanation of the different Face Cards and Glasses Eights can be found below.

	* To play a Face Card or Glasses Eight, click the card in your hand to select it, then click your field (in green) to play it.
5. **One-Offs:**
Ace-Sevens and also Nines can be played as **One-Offs**. Playing a card for a One-Off effect discards (to the scrap pile) in exchange for an effect, based on the rank of the card. A list of all the effects can be found below.

	* To play a card as a **One-Off**, click a card in your hand to select it, then click the **Scrap Pile** or an opponent's card to target.

### One-Offs

* **Ace**: Destroy all **Point** cards
* **Two**: One of two effects:
	1. Destroy **target Face Card or Glasses Eight**
	2. Counter **target One-Off** (play this when an opponent plays a **One-Off** effect to stop it from happening)
* **Three**: Choose one card from the **Scrap Pile** and put it in your hand.
* **Four**: Your opponent discards two cards of her choice from her hand to the **Scrap Pile**
* **Five**: Draw two cards from the **Deck**.
* **Six**: Destroy all **Face Cards and Glasses Eights**
* **Seven**: Reveal the top two cards from the **Deck** and choose one of them to play immediately. Play this card however you would like. The other card is placed back on top of the deck.
* **Nine**: Return an opponent's card on the board to their hand. It can't be played next turn.

### Face Cards & Glasses Eights
* **Eight**: While you control an Eight as a  **"Glasses Eight"**, your opponent plays with her hand revealed to you. Unlike one-offs, Glasses Eights remain under your control until destroyed.
* **Jack**: Play a jack on top of a **Point Card** to move it to your side of the board. You keep control of the point card as long as you control the top jack.
* **Queen**: While you control a Queen, your other cards cannot be **targeted** by your opponent's cards.
* **King**: While you have a King, the minimum points needed to win is reduced. Each additional King further reduces the limit.
	* 1 King: 14 points to win
	* 2 Kings: 10 points to win
	* 3 Kings: 7 points to win
	* 4 Kings: 5 points to win

### FAQ
#### Can I play a two to counter a point card? What about a scuttle? Can I play a two to destroy my opponent's Face Card or Glasses Eight on her turn?

Nope! Twos can only counter One-Offs. You can play a two to destroy a Face Card or Glasses Eight, but this takes your turn, unlike countering.

#### Do Queens protect against countering with a two?
Yes! Queens protect against **targeting**, when a card applies a unique effect to one specific card. This means your other cards (not the Queen, herself) are protected against Twos (either effect), Nines, and Jacks.

#### Can I counter a Two with a Two?
Heck yeah! Playing a Two to counter is a **One-Off**, which can be **countered** with a two. Stacked counters make for exciting plays.

#### Can I win by playing a King?
Yes. If you meet the required number of points, you win immediately. This means if you play a King when you already have enough points to meet the new limit, you win on that turn.

#### If I play an Ace or a Six, are my cards destroyed as well?
Yes. Aces and Sixes destroy all **Point Cards** and all **Face Cards and Glasses Eights**, respectively. That includes any that you have out. Try to avoid destroying many of your own cards!

#### Where can I play Cuttle?
You can play Cuttle anywhere you have a deck of cards and a friend! If you want to play online, there is only one place: [Play Cuttle!](https://cuttle-v2.herokuapp.com/)