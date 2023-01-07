import Geometry from "./geometry";

// This structure is used to describe linear motion.
class Linear {
  constructor() {
    this.movex = 0;
    this.movey = 0;
    this.movet = 0; // time in milliseconds
  }
}

class Box {
  constructor(id, geometry, linear, more) {
    // if linear is undefined then the box is static
    this.stats = {
      id: id,
      linear: linear == undefined ? new Linear() : linear,
      geometry: geometry == undefined ? new Geometry() : geometry,
      type: "box",
      extra: {
        sound: "",
        mirrorOnWayBack: false,
        speedX: 0,
        speedY: 0,
        dest: "",
        clockFont: "",
        src: "",
        timerId: 0,
      }, // used for some special boxes like teleport,
      style: {
        backgroundColor: "",
        backgroundImage: "",
        backgroundSize: "",
        backgroundRepeat: "",
        backgroundPosition: "",
        border: "",
        boxShadow: "",
        overflow: "",
        borderRadius: 0,
        transform: "",
      },
      interactable: true,
      sideBump: false, // if player or bullet bumps into the side
      reverseGravityBump: false, // if player bumps into box when gravity is reversed
      bottomBump: false,
      wall: false,
      deleteAfter: -1,
      stock: false,
      fakeStock: false,
      resistance: 30, // how much box will go down when player is standing on it
      resistanceSpeed: 0.5,
      displacement: 0, // hom much box currently is displaced
      overrideBg: false,
    };

    if (more != undefined) {
      for (let key in more) {
        if (key != "geometry" && key != "linear") this.stats[key] = more[key];
      }
    }
  }

  isMovingForward(timeStamp) {
    if (this.stats.linear == undefined || this.stats.linear.movet == 0)
      return true;
    return Math.floor(timeStamp / this.stats.linear.movet) % 2 == 0;
  }

  getTimeFrac(timeStamp) {
    if (this.stats.linear == undefined || this.stats.linear.movet == 0)
      return 0;
    let d = timeStamp / this.stats.linear.movet;
    return d - Math.floor(d);
  }

  getLinearX(timeStamp) {
    if (this.stats.linear == undefined) return 0;
    else {
      let x = this.getTimeFrac(timeStamp) * this.stats.linear.movex;
      return this.isMovingForward(timeStamp) ? x : this.stats.linear.movex - x;
    }
  }

  getLinearY(timeStamp) {
    if (this.stats.linear == undefined) return 0;
    else {
      let y = this.getTimeFrac(timeStamp) * this.stats.linear.movey;
      return this.isMovingForward(timeStamp) ? y : this.stats.linear.movey - y;
    }
  }

  getLeftX(timeStamp) {
    return this.stats.geometry.getLeftX() + this.getLinearX(timeStamp);
  }

  getBottomY(timeStamp) {
    return this.stats.geometry.getBottomY() + this.getLinearY(timeStamp);
  }

  getRightX(timeStamp) {
    return this.stats.geometry.getRightX() + this.getLinearX(timeStamp);
  }

  getTopY(timeStamp) {
    return this.stats.geometry.getTopY() + this.getLinearY(timeStamp);
  }

  getW() {
    return this.stats.geometry.getW();
  }

  getH() {
    return this.stats.geometry.getH();
  }

  setLeftX(x) {
    this.stats.geometry.setLeftX(x);
  }

  setBottomY(y) {
    this.stats.geometry.setBottomY(y);
  }

  setW(w) {
    this.stats.geometry.setW(w);
  }

  setH(h) {
    this.stats.geometry.setH(h);
  }
}

export default Box;
export { Linear };
