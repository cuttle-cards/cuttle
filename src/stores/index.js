import { createStore } from 'vuex';

import auth from '@/store/modules/auth';
import gameList from '@/store/modules/gameList';
import game from '@/store/modules/game';

export default new createStore({
  modules: {
    auth,
    gameList,
    game,
  },
});
