export const mockLocalStorage = () => {
  const store = {};
  const localStorageMock = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    }
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  return store;
};

