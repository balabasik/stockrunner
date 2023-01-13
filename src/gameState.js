import Box from "./box";
import Geometry from "./geometry";
import { Linear } from "./box";
import LoadMap1 from "./map1";

const defaultBoxStyle = { backgroundColor: "blue" };

const leftGearLetters = [
  "Z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "A",
];
const rightGearLetters = [
  "ABC",
  "DEFG",
  "HIJ",
  "KLMN",
  "OPQ",
  "RSTU",
  "VWX",
  " YZ ",
];

class GameState {
  // Timestamp is needed to compute positions of dynamic elements
  constructor(physics) {
    this.physics = physics;
    this.timeStamp = 0;
    this.gameTime = 0;
    this.player = null;
    this.playerKeys = null;
    this.boxes = {};
    this.stocks = {};
    this.dateToIds = {};
    this.leftGear = {};
    this.rightGear = {};
    this.stockFilter = [];
    this.shiftStockId = 0;
    this.clicks = 0;

    this.resetPhysicsStats();
    this.resetFirePosX();
    LoadMap1(this);
  }

  resetFirePosX() {
    this.firePosX = -200;
  }

  resetPhysicsStats() {
    this.physicsStats = {
      gravityG: 0.009, //0.0044,
      gameStatus: { paused: true, winner: false },
    };
  }

  // NOT INTERACTABLE
  createBgBox(x, y, w, h, bgStyle, more) {
    let geometry = new Geometry();
    let id = Object.keys(this.boxes).length;
    let box = new Box(id, geometry, undefined, more);
    box.setLeftX(x);
    box.setBottomY(y);
    box.setH(h);
    box.setW(w);
    box.stats.style = bgStyle == undefined ? defaultBoxStyle : bgStyle;
    box.stats.interactable = false;
    this.boxes[id] = box;
    return id;
  }

  createStaticBox(x, y, w, h, bgStyle, more) {
    let geometry = new Geometry();
    let id = Object.keys(this.boxes).length;
    let box = new Box(id, geometry, undefined, more);
    box.setLeftX(x);
    box.setBottomY(y);
    box.setH(h);
    box.setW(w);
    box.stats.style = bgStyle == undefined ? defaultBoxStyle : bgStyle;
    box.stats.interactable = true;
    this.boxes[id] = box;
    return id;
  }

  // box1 is source, box2 is destination
  convertBoxToTeleport(box1, box2) {
    box1.stats.type = "teleport";
    box1.stats.extra["dest"] = box2.stats.id;

    // making both boxes as teleports
    box2.stats.type = "teleport";
    box2.stats.extra["dest"] = box1.stats.id;
  }

  convertLastBoxToSpring(speedX, speedY) {
    this.convertBoxToSpring(
      this.boxes[Object.keys(this.boxes).length - 1],
      speedX,
      speedY
    );
  }

  convertBoxToSpring(box, speedX, speedY) {
    box.stats.type = "spring";
    box.stats.extra["speedX"] = speedX;
    box.stats.extra["speedY"] = speedY;
  }

  // dynamic boxes
  createDynamicBox(x, y, w, h, movex, movey, movet, bgStyle, more) {
    var geometry = new Geometry();
    var linear = new Linear();
    let id = Object.keys(this.boxes).length;
    linear.movex = movex;
    linear.movey = movey;
    linear.movet = movet;
    let box = new Box(id, geometry, linear, more);
    box.setLeftX(x);
    box.setBottomY(y);
    box.setH(h);
    box.setW(w);
    box.stats.style = bgStyle == undefined ? defaultBoxStyle : bgStyle;
    this.boxes[id] = box;
    return id;
  }
}

export default GameState;
export { leftGearLetters, rightGearLetters };
