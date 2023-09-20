import devtools from '@vue/devtools';
import { version } from '_/package.json';
import { useGameStore } from '@/stores/game';
import { useAuthStore } from '@/stores/auth';
import { useGameListStore } from '@/stores/gameList';
import { useRouter } from 'vue-router';

export function initCuttleGlobals() {
  // We work under the assumption that this function will only be called in a context
  // where the window object exists. If we plan to ever call this on the server we'll
  // need to revisit the implementation


  const test = window.Cypress != null;
  const cuttle = {
    version,
    test,
  };
  window.cuttle = cuttle;


     //Pass store to window object on testing
  if (test) { 
    window.gameStore = useGameStore();
    window.authStore = useAuthStore();
    window.gameListStore = useGameListStore();
    window.cuttleRouter = useRouter();
    }


  // Connect the devtools -- non-prod only
  if (import.meta.env.DEV) {
    try {
      devtools.connect(null, 8098);
      console.log('Vue devtools connected');
    } catch(err) {
      console.warn('Failed to connect vue devtools - try running npm run start:devtools');
    }
  }

}
