(function(){
  const lsGet = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? fallback);
    } catch (error) {
      return JSON.parse(fallback);
    }
  };

  const lsSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  };

  const getScopedString = (key, fallback = '') => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw);
      } catch (error) {
        return raw;
      }
    } catch (error) {
      return fallback;
    }
  };

  window.KivoStorage = {
    lsGet,
    lsSet,
    getScopedString
  };
})();
