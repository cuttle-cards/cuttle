import Vuex from 'vuex';

import auth from '@/store/modules/auth';
import gameList from '@/store/modules/gameList';
import game from '@/store/modules/game';

export default new Vuex.Store({
  modules: {
    auth,
    gameList,
    game,
  },
});
