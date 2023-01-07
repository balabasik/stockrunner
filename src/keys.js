// This class evolved, and is used as a container for the player information
// that is sent to the server on each update, not jsut player keys.
class Keys {
  constructor(stats) {
    this.resetAllKeys(stats);
  }

  resetAllKeys(stats) {
    this.mouseX = 0; // in the world coordinates, not in frame coordinates.
    this.mouseY = 0;
    this.leftKey = false;
    this.rightKey = false;
    this.upKey = false;
    this.downKey = false;
    this.rightClick = false;
    this.rightClickEvents = 0;
    this.leftClick = false;

    this.clientX = 0;
    this.clientY = 0;

    this.clientSpeedX = 0;
    this.clientSpeedY = 0;

    this.timeStamp = 0;

    this.CLIENT_META = {
      escActive: false,
      escUp: true,
    };

    if (stats != undefined) {
      for (let key in stats) this[key] = stats[key];
    }
  }

  onEscDown() {
    if (!this.CLIENT_META.escUp) return;
    this.CLIENT_META.escActive = !this.CLIENT_META.escActive;
    this.CLIENT_META.escUp = false;
  }

  onEscUp() {
    this.CLIENT_META.escUp = true;
  }

  onMouseDown() {
    // NOTE: Browser thinks that right click is the same as left click
    if (this.rightClick) return;
    this.leftClick = true;
  }

  onMouseUp() {
    this.leftClick = false;
    // Browser doesn't issue right click up for mouse for some reason
    this.rightClick = false;
  }

  // NOTE: Player controls its active gun, it is not server dependent
  onRightClickDown() {
    this.rightClick = true;
    this.rightClickEvents++;
    // NOTE: Browser thinks that right click is the same as left click
    this.leftClick = false;
  }

  onRightClickUp() {
    this.rightClick = false;
  }

  // TODO: Angle has to be updated when player moves as well.
  setMouse(mouseX, mouseY, mouseAngle) {
    this.mouseX = Math.floor(mouseX);
    this.mouseY = Math.floor(mouseY);
    this.mouseAngle = Math.floor(mouseAngle);
  }

  onKeyDown(evt) {
    switch (evt.keyCode) {
      case 37:
      case 65:
        this.leftKey = true;
        break;
      case 39:
      case 68:
        this.rightKey = true;
        break;
      case 40:
        this.downKey = true;
        break;
      case 32:
        this.CLIENT_META.zoomKey = true;
        break;
      case 38:
      case 87:
        this.upKey = true;
        break;
      case 27:
        this.onEscDown();
        break;
    }
  }

  onKeyUp(evt) {
    switch (evt.keyCode) {
      case 37:
      case 65:
        this.leftKey = false;
        break;
      case 39:
      case 68:
        this.rightKey = false;
        break;
      case 40:
        this.downKey = false;
        break;
      case 38:
      case 87:
        this.upKey = false;
        break;
      case 32:
        this.CLIENT_META.zoomKey = false;
        break;
      case 27:
        this.onEscUp();
        break;
    }
  }
}

export default Keys;
