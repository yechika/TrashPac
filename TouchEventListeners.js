class TouchEventListeners {
  constructor(element, callback) {
    element.addEventListener('touchstart', () => {
      callback();
    });
    element.addEventListener('touchend', () => {
      
    });
  }
}
