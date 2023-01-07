import { WeightedSumm } from "./utils";

const interpolationFactor = 0.1;

class Transform {
  constructor(transform) {
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotate = 0;
    this.moveX = 0;
    this.moveY = 0;

    if (transform != undefined) {
      this.scaleX = transform.scaleX;
      this.scaleY = transform.scaleY;
      this.rotate = transform.rotate;
      this.moveX = transform.moveX;
      this.moveY = transform.moveY;
    }
  }

  interpolate(transform) {
    if (transform == undefined) return;
    this.scaleX = WeightedSumm(
      this.scaleX,
      transform.scaleX,
      interpolationFactor
    );
    this.scaleY = WeightedSumm(
      this.scaleY,
      transform.scaleY,
      interpolationFactor
    );
    this.rotate = WeightedSumm(
      this.rotate,
      transform.rotate,
      interpolationFactor
    );
    this.moveX = WeightedSumm(this.moveX, transform.moveX, interpolationFactor);
    this.moveY = WeightedSumm(this.moveY, transform.moveY, interpolationFactor);
  }
}

class Geometry {
  constructor(geometry) {
    // absolute coordinates of the left bottom corner
    this.leftX = 0;
    this.bottomY = 0;

    // bounding box?
    this.width = 100;
    this.height = 100;

    this.pivotX = this.width / 2;
    this.pivotY = this.height / 2;
    this.transform = new Transform();

    if (geometry != undefined) {
      this.leftX = geometry.leftX;
      this.bottomY = geometry.bottomY;

      // bounding box
      this.width = geometry.width;
      this.height = geometry.height;

      this.pivotX = geometry.pivotX;
      this.pivotY = geometry.pivotY;
      this.transform = new Transform(geometry.transform);
    }
  }

  interpolate(geometry) {
    if (geometry == undefined) return;
    this.leftX = WeightedSumm(this.leftX, geometry.leftX, interpolationFactor);
    this.bottomY = WeightedSumm(
      this.bottomY,
      geometry.bottomY,
      interpolationFactor
    );

    // bounding box
    this.width = WeightedSumm(this.width, geometry.width, interpolationFactor);
    this.height = WeightedSumm(
      this.height,
      geometry.height,
      interpolationFactor
    );

    this.pivotX = WeightedSumm(
      this.pivotX,
      geometry.pivotX,
      interpolationFactor
    );
    this.pivotY = WeightedSumm(
      this.pivotY,
      geometry.pivotY,
      interpolationFactor
    );

    this.transform.interpolate(geometry.transform);
  }

  getLeftX() {
    return this.leftX + this.transform.moveX;
  }
  getBottomY() {
    return this.bottomY + this.transform.moveY;
  }
  getRightX() {
    return this.leftX + this.transform.moveX + this.getW();
  }
  getTopY() {
    return this.bottomY + this.transform.moveY + this.getH();
  }
  setLeftX(x) {
    this.transform.moveX = x - this.leftX;
  }
  setBottomY(y) {
    this.transform.moveY = y - this.bottomY;
  }
  getPivotX() {
    return this.pivotX * Math.abs(this.transform.scaleX);
  }
  getPivotY() {
    return this.pivotY * Math.abs(this.transform.scaleY);
  }

  getW() {
    return this.width * Math.abs(this.transform.scaleX);
  }
  getH() {
    return this.height * Math.abs(this.transform.scaleY);
  }
  setW(width) {
    this.transform.scaleX = width / this.width;
  }
  setH(height) {
    this.transform.scaleY = height / this.height;
  }
}

export default Geometry;
export { Transform };
