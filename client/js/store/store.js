import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import gameList from './modules/gameList';
import game from './modules/game';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		auth,
		gameList,
		game
	}
});
