class TouchEventListeners {
    constructor(element, callback) {
      element.addEventListener('touchstart', () => {
        callback();
      });
      element.addEventListener('touchend', () => {
        // Stop the movement when touch is released
        // Add any additional logic here if needed
      });
    }
  }
 