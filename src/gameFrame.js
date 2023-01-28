import React, { Component } from "react";
import { GetTime, GetHashFromString, GetRand, DoBoxesOverlap } from "./utils";
import Wall from "./wall";

const worldBgStyle = {
  position: "absolute",
  left: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
};

const renderShadow = false;

const glowPallette = [
  "rgb(255, 104, 94)",
  "rgb(255, 220, 94)",
  "rgb(252, 255, 94)",
  "rgb(94, 255, 96)",
  "rgb(255, 94, 229)",
  "rgb(94, 255, 255)",
];

const fullBoxStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  width: "100%",
  height: "100%",
};

const avaTopStyle1 = {
  position: "absolute",
  left: 0,
  bottom: 5,
  width: 30,
  height: 30,
};

const avaTopStyle2 = {
  position: "absolute",
  right: 0,
  bottom: 5,
  width: 30,
  height: 30,
};

const avaTopStyleYou = {
  position: "absolute",
  left: "28%",
  bottom: 0,
  width: 50,
  height: 40,
};

function getDarkeningFilter(time) {
  let period = 4;
  let frac =
    Math.abs(((time / 1000 / 60) % period) - period / 2) / (period / 2);
  let hue = 180 * frac;
  let bright = 100 - 20 * frac;
  // Uncomment to also use hue.
  // hue-rotate(" + hue + "deg)
  return "brightness(" + bright + "%)";
}

function GetHueFilterFromHash(hash) {
  let hue = (GetHashFromString(hash) % 360) - 180;
  return "hue-rotate(" + hue + "deg)";
}

function getColorFromRatio(ratio) {
  return ratio > 70
    ? "rgb(152, 237, 120)"
    : ratio > 30
    ? "rgb(255, 253, 134)"
    : "rgb(250, 72, 72)";
}

function RenderPlayer(player, mirrorY) {
  if (player.stats.isDead) return <div key={player.id} />;

  let playerX = player.getLeftX();
  let playerY = player.getBottomY();

  let playerW = player.getW();
  let playerH = player.getH();

  let mirrorPlayerX = player.sprite.faceRight ? 1 : -1;
  let mirrorPlayerY = 1;

  if (mirrorY) mirrorPlayerY = -1;
  // NOTE: Scale is taken care of by size of the image.
  let playerTransform =
    "scaleX(" + mirrorPlayerX + ")" + " scaleY(" + mirrorPlayerY + ")";

  return (
    <div
      key={player.id}
      style={{
        position: "absolute",
        left: Math.floor(playerX),
        bottom: Math.floor(playerY),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: playerW,
          height: playerH,
          transform: playerTransform,
          //backgroundColor: "blue",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: player.sprite.stepW,
            height: "100%",
            overflow: "hidden",
            transform: "translateX(-50%)",
            //outline: "1px solid black",
          }}
        >
          <img
            style={{
              position: "absolute",
              left: player.sprite.leftShift,
              top: player.sprite.topShift,
              height: "300%",
            }}
            src={player.sprite.srcs[player.sprite.avatar]}
          />
        </div>
      </div>
    </div>
  );
}

class GameWorld extends Component {
  constructor(props) {
    super(props);
    this.perkBumpTime = {};
  }

  noOverlapBox(box) {
    return this.noOverlap(
      Math.floor(box.getLeftX(this.props.gameState.timeStamp)),
      Math.floor(box.getBottomY(this.props.gameState.timeStamp)),
      Math.floor(box.getW()),
      Math.floor(box.getH())
    );
  }

  renderBox(key) {
    let box = this.props.gameState.boxes[key];
    if (this.noOverlapBox(box)) {
      return;
    }
    let mirror =
      !box.isMovingForward(this.props.gameState.timeStamp) &&
      box.stats.extra != undefined &&
      box.stats.extra.mirrorOnWayBack == true;
    let transform = mirror ? "scaleX(-1)" : "";
    let style = box.stats.overrideBg
      ? { ...box.stats.style, backgroundColor: box.stats.overrideBg }
      : box.stats.style;
    let textProps = {};
    if (box.stats.text) {
      textProps = {
        fontSize: box.stats.text.fontSize,
        fontFamily: box.stats.text.fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: box.stats.text.color,
      };
    }
    return (
      <div
        key={box.stats.id}
        style={{
          transform,
          ...style,
          position: "absolute",
          left: Math.floor(box.getLeftX(this.props.gameState.timeStamp)),
          bottom: Math.floor(box.getBottomY(this.props.gameState.timeStamp)),
          width: Math.floor(box.getW()),
          height: Math.floor(box.getH()),
          transition: box.stats.stockDiff
            ? "height ease-in-out 0.2s" //background-color ease-in-out 0.2s"
            : this.props.gameState.transitionDelay &&
              box.stats.linear.movet == 0
            ? "bottom ease-in-out 0.2s"
            : "",
          opacity:
            (box.stats.stock || box.stats.fakeStock || box.stats.stockDiff) &&
            this.props.gameState.physicsStats.invisible
              ? 0
              : 1,
          ...textProps,
        }}
      >
        {box.stats.text ? box.stats.text.text : undefined}
      </div>
    );
  }

  renderFire() {
    let display = this.props.gameState.firePosX > -this.props.worldLeftX;
    let left = display ? -this.props.worldLeftX : this.props.gameState.firePosX;
    let width = Math.min(
      this.props.gameState.frameWidth,
      Math.abs(this.props.gameState.firePosX + this.props.worldLeftX)
    );
    return (
      <div
        style={{
          position: "absolute",
          left: left,
          bottom: 0,
          width: width,
          height: this.props.gameState.worldHeight - 25,
          backgroundColor: "red",
          display: "flex",
          alignItems: "center",
          justifyContent: "right",
          outline: "6px solid #000000",
          //transition: "width ease-in-out 0.2s",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 200,
            height: "50%",
            fontSize: 120,
            fontFamily: "Audiowide-Regular",
            //justifyContent: "center",
          }}
        >
          <div
            style={{
              marginTop: 25,
              position: "relative",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            2
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: -50,
            }}
          >
            0
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: -50,
            }}
          >
            2
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: -50,
            }}
          >
            2
          </div>
        </div>
      </div>
    );
  }

  noOverlap(leftX, bottomY, w, h) {
    return !DoBoxesOverlap(
      -this.props.worldLeftX,
      -this.props.worldBottomY,
      -this.props.worldLeftX + this.props.gameState.frameWidth,
      -this.props.worldBottomY + this.props.gameState.frameHeight,
      leftX,
      bottomY,
      leftX + w,
      bottomY + h
    );
  }

  renderPerks(key) {
    let perk = this.props.gameState.perks[key].stats;

    if (this.noOverlap(perk.position[0], perk.position[1], perk.w, perk.h))
      return "";

    let perkSrc = "./perk_" + perk.type + ".png";
    let time = GetTime();
    if (this.perkBumpTime[key] == undefined) this.perkBumpTime[key] = time;
    let timeSinceBump = time - this.perkBumpTime[key];
    let left = Math.floor(perk.position[0]);
    let speedY = 0.04;
    let period = 700; // ms
    let shiftY =
      speedY * timeSinceBump -
      (speedY / period) * timeSinceBump * timeSinceBump;
    shiftY = Math.max(0, shiftY);
    if (shiftY == 0) this.perkBumpTime[key] = time;
    let bottom = Math.floor(perk.position[1]) + shiftY;
    let scale = 1;
    let width = perk.w * scale;
    let height = perk.h / scale;
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left,
          bottom,
          width,
          height,
        }}
      >
        <img
          src={perkSrc}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  }

  getShadow() {
    if (!renderShadow) return "";
    let xShadow =
      30 + (150 * this.props.worldLeftX) / this.props.gameState.worldWidth;
    let yShadow =
      -20 - (120 * this.props.worldBottomY) / this.props.gameState.worldHeight;
    return {
      WebkitFilter: `drop-shadow(${xShadow}px ${yShadow}px 2px rgba(0,0,0,0.4))`,
    };
  }

  render() {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/*<div
          style={{
            ...worldBgStyle,
            position: "absolute",
            backgroundSize: "cover",
            width: this.props.gameState.worldWidth * 0.95,
            height: this.props.gameState.worldHeight,
            left:
              this.props.worldLeftX * 0.88 +
              (this.props.gameState.zoomOut - 1.5) * 120,
            bottom: this.props.worldBottomY,
            transform:
              "scaleX(" +
              ((this.props.gameState.zoomOut - 1.5) * 0.048 + 1) +
              ")",
            backgroundColor: this.props.gameState.mapStyle.front,
            transition: "left ease-in-out 0.2",
          }}
        />*/}
        <div
          style={{
            position: "absolute",
            width: this.props.gameState.worldWidth,
            height: this.props.gameState.worldHeight,
            left: this.props.worldLeftX,
            bottom: this.props.worldBottomY,
            transition: "left ease-in-out 0.2",
          }}
        >
          <div
            style={{
              ...fullBoxStyle,
              ...this.getShadow(),
            }}
          >
            {Object.keys(this.props.gameState.boxes).map((key) =>
              this.renderBox(key)
            )}
            {Object.keys(this.props.gameState.perks).map((key) =>
              this.renderPerks(key)
            )}
            {RenderPlayer(
              this.props.gameState.player,
              this.props.gameState.physicsStats.gravityG < 0
            )}
            {this.renderFire()}
          </div>
        </div>
      </div>
    );
  }
}

class GameFrame extends Component {
  constructor(props) {
    super(props);
    this.start = GetTime();
    this.renderCnt = 1;
    this.newPropsCnt = 0;
  }

  /*componentWillReceiveProps(props) {
    this.newPropsCnt++;
    //console.log(this.newPropsCnt);
  }*/

  render() {
    /*this.renderCnt += 1;
    if (this.renderCnt % 100 == 1) {
      let now = GetTime();
      console.log(
        "Render 100 delay:",
        (now - this.start) / 100,
        "Props updates:",
        this.newPropsCnt
      );
      this.renderCnt = 1;
      this.newPropsCnt = 0;
      this.start = now;
    }*/
    return (
      <div>
        {<Wall gameState={this.props.gameState} />}
        <GameWorld
          gameState={this.props.gameState}
          worldLeftX={this.props.worldLeftX}
          worldBottomY={this.props.worldBottomY}
        />
      </div>
    );
  }
}

export default GameFrame;
export { RenderPlayer };
