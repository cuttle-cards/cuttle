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

export { getLocalStorage, setLocalStorage };
