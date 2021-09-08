let loaded = false;

export function onWindowLoad() {
  return new Promise((resolve) => {
    if (loaded) {
      resolve(true);
    } else if (['loaded', 'interactive', 'complete'].indexOf(document.readyState) > -1) {
      loaded = true;
      resolve(true);
    } else {
      window.addEventListener(
        'load',
        () => {
          loaded = true;
          resolve(true);
        },
        false,
      );
    }
  });
}