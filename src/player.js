import Geometry from "./geometry";
import Sprite from "./sprite";

class Player {
  constructor(playerInfo) {
    if (playerInfo == undefined) playerInfo = { playerName: "random" };
    this.playerName = playerInfo.playerName;
    this.geometry = new Geometry();
    this.geometry.pivotY -= 10;
    this.stats = {};
    this.wasDead = false;
    this.sprite = new Sprite(this);
    this.clientStats = { isWalking: false };
    this.initStats();
  }

  initStats() {
    this.sprite.reset();
    this.stats.origSpeedX = 1.5; //0.55;
    this.stats.origSpeedY = 2.8; //1.5;
    this.stats.isWalking = false;
    this.stats.isTouchingBox = false;
    this.stats.stockChanges = 0;

    this.stats.isDead = true; // on creation player is dead
    this.stats.speedX = 0;
    this.stats.speedY = 0;
    this.stats.extraSpeedX = 0;
    this.stats.extraSpeedXDecay = 0.025; // ground friction

    this.stats.intendedMoveX = 0;
    this.stats.intendedMoveY = 0;

    this.stats.posX = 0;
    this.stats.posY = 0;

    this.setW(160);
    this.setH(240);

    // Is used to teleport the player
    this.stats.teleportTo = { active: false }; //, x: 0, y: 0 };
    this.stats.onSpring = false;
  }

  getLeftX() {
    return this.geometry.getLeftX();
  }

  getBottomY() {
    return this.geometry.getBottomY();
  }

  getRightX() {
    return this.geometry.getRightX();
  }

  getTopY() {
    return this.geometry.getTopY();
  }

  getPivotX() {
    return this.geometry.getPivotX();
  }

  getPivotY() {
    return this.geometry.getPivotY();
  }

  getW() {
    return this.geometry.getW();
  }

  getH() {
    return this.geometry.getH();
  }

  setLeftX(x) {
    this.geometry.setLeftX(x);
  }

  setBottomY(y) {
    this.geometry.setBottomY(y);
  }

  setW(w) {
    this.geometry.setW(w);
  }

  setH(h) {
    this.geometry.setH(h);
  }
}

export default Player;
