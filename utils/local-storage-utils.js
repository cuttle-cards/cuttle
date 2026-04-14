const LS_PREFERS_RANKED_NAME = 'prefersRanked';
const LS_IS_RETURNING_USER_NAME = 'isReturningUser';
const LS_PLAY_TIME_DIALOG_DISMISSED = 'playTimeDialogDismissed';

const getLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Error handling
  }
};

export {
  getLocalStorage,
  setLocalStorage,
  LS_PREFERS_RANKED_NAME,
  LS_IS_RETURNING_USER_NAME,
  LS_PLAY_TIME_DIALOG_DISMISSED,
};
