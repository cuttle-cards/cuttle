import store from '../store/store.js';
import router from '../router/index.js';
let _ = require('lodash');

export const io = require('sails.io.js')(require('socket.io-client'));

if (process.env.NODE_ENV != 'production') {
	io.sails.url = process.env.VUE_APP_API_URL || 'localhost:1337';
}
io.sails.useCORSRouteToGetCookie = false;
io.sails.reconnection = true;
// Handles socket updates of game data
io.socket.on('game', function(evData) {
	switch (evData.verb) {
	case 'updated':
		// Handle GameOver
		if (evData.data.victory && evData.data.victory.gameOver) {
			setTimeout(() => {
				store.commit('setGameOver', evData.data.victory);
			}, 1000);
		}
		switch (evData.data.change) {
		case 'ready':
			store.commit('updateReady', evData.data.pNum);
			break;
		case 'Initialize':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			router.push(`/game/${store.state.game.id}`);
			break;
		case 'draw':
		case 'pass':
		case 'points':
		case 'faceCard':
		case 'scuttle':
		case 'loadFixture':
		case 'jack':
		case 'deleteDeck':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			break;
		case 'resolveThree':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			store.commit('setPickingFromScrap', false)
			store.commit('setWaitingForOpponentToPickFromScrap', false);
			break;
		case 'resolveFour':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			store.commit('setWaitingForOpponentToDiscard', false);
			store.commit('setDiscarding', false);
			break;
		case 'resolve':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			store.commit('setWaitingForOpponentToCounter', false);
			if (evData.data.happened) {
				switch (evData.data.oneOff.rank) {
				case 3:
					if (evData.data.playedBy !== store.state.game.myPNum) {
						store.commit('setWaitingForOpponentToPickFromScrap', true);
					} else {
						store.commit('setPickingFromScrap', true);
					}
					break;
				case 4:
					if (evData.data.playedBy === store.state.game.myPNum) {
						store.commit('setWaitingForOpponentToDiscard', true);
					} else {
						store.commit('setDiscarding', true);
					}
					break;
				case 7:
					if (evData.data.playedBy === store.state.game.myPNum) {
						store.commit('setPlayingFromDeck', true);
					} else {
						store.commit('setWaitingForOpponentToPlayFromDeck', true);
					}
					break;
				default:
					break;
				}
			}
			break;
		case 'targetedOneOff':
		case 'oneOff':
		case 'counter':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			if (evData.data.pNum !== store.state.game.myPNum) {
				store.commit('setWaitingForOpponentToCounter', false);
				store.commit('setMyTurnToCounter', true);
			}
			break;
		// Sevens
		case 'sevenPoints':
		case 'sevenFaceCard':
		case 'sevenJack':
		case 'sevenScuttle':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			store.commit('setPlayingFromDeck', false);
			store.commit('setWaitingForOpponentToPlayFromDeck', false);
			break;
		case 'sevenOneOff':
		case 'sevenTargetedOneOff':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			store.commit('setPlayingFromDeck', false);
			store.commit('setWaitingForOpponentToPlayFromDeck', false);
			if (evData.data.pNum !== store.state.game.myPNum) {
				store.commit('setWaitingForOpponentToCounter', false);
				store.commit('setMyTurnToCounter', true);
			}
			break;
		case 'reLogin':
			store.dispatch('updateGameThenResetPNumIfNull', evData.data.game);
			break;
		}
	default:
		break;
	}
});

io.socket.on('gameCreated', function(evData) {
	const newGame = _.cloneDeep(evData);
	store.commit('addGameToList', newGame);
});

io.socket.on('gameStarting', function(evData) {
	store.commit('removeGame', evData);
});

io.socket.on('join', function(evData) {
	store.commit('joinGame', {
		gameId: evData.gameId,
		newPlayer: evData.newPlayer,
		newStatus: evData.newStatus,
	});
	// If we are in game: update our game with new player
	if (evData.gameId === store.state.game.id) {
		store.commit('opponentJoined', evData.newPlayer);
	}
});

io.socket.on('leftGame', function(evData) {
	if (evData.id === store.state.game.id) {
		store.commit('opponentLeft');
	} else {
		store.commit('otherLeftGame', evData.id);
	}
});
