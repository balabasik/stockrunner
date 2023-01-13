import React, { Component } from "react";
import Physics from "./physics";
import GameFrame, { RenderPlayer } from "./gameFrame";
import LowBar from "./lowBar";
import HighBar from "./highBar";
import Keys from "./keys";
import { GetTime } from "./utils";
import GameUi from "./gameUi";
import Button from "./button";
import Player from "./player";
import Winner from "./winner";

const frameStyle = {
  width: "100%",
  height: "100%",
  position: "absolute",
  borderStyle: "solid",
  borderWidth: 0,
  borderColor: "red",
  overflow: "hidden",
};

const pageStyle = {
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "#e1f6bb",
  cursor: "url(./cursor.png),auto",
  overflow: "hidden",
};

const globalHolderStyle = {
  position: "absolute",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "black",
  //backgroundColor: "rgb(4, 5, 13)",
  overflow: "hidden",
};

const defaultScale = 0.3;
const extraScale = 1.4;

const frameWidth = 2160; //1920; //1400 * extraScale;
const frameHeight = 1080; //720 * extraScale;

const maxZoom = 2.64; // NOTE: This has to be carefully adjusted to avoid over-the-border zoom
const minZoom = 1.385; //1.5;

function getFrameWidth(zoom) {
  if (zoom == undefined) zoom = minZoom;
  return frameWidth * zoom;
}

function getFrameHeight(zoom) {
  if (zoom == undefined) zoom = minZoom;
  return frameHeight * zoom;
}

function getScale(winW, winH, zoom) {
  return Math.max(
    defaultScale,
    Math.min(winW / getFrameWidth(zoom), winH / getFrameHeight(zoom))
  );
}

function getLeft(winW, winH, zoom) {
  // When you scale, window still thinks of the div as of original size, so we need to compensate for that
  return (
    (winW - getFrameWidth(zoom) * getScale(winW, winH, zoom)) / 2 -
    (getFrameWidth(zoom) * (1 - getScale(winW, winH, zoom))) / 2
  );
}

function getBottom(winW, winH, zoom) {
  return (
    (winH - getFrameHeight(zoom) * getScale(winW, winH, zoom)) / 2 -
    (getFrameHeight(zoom) * (1 - getScale(winW, winH, zoom))) / 2
  );
}

const emptyKeys = new Keys();

class GamePlay extends Component {
  constructor(props) {
    super(props);
    let w = window.innerWidth;
    let h = window.innerHeight;
    this.state.windowScale = getScale(w, h);
    this.state.windowLeft = getLeft(w, h);
    this.state.windowBottom = getBottom(w, h);

    let ramona = new Player();
    ramona.stats.isDead = false;
    ramona.sprite.avatar = "ramona";
    let scott = new Player();
    scott.stats.isDead = false;
    scott.sprite.avatar = "scott";

    this.avatars = { scott, ramona };
  }

  handleGameStop() {
    if (this.state.stopInitiated) return;
    this.state.stopInitiated = true;
    this.state.physics.stop();
    delete this.state.physics;
    this.props.onStop();
  }

  componentDidMount() {
    this.updateMenuPlayers();
    this.setState({ firstLoad: false });
    window.addEventListener("keydown", (event) => {
      this.state.keys.onKeyDown(event);
      this.keysUpdatedEvent();
    });
    window.addEventListener("keyup", (event) => {
      // NOTE: Even if we are in the chat mode we do not return here.
      this.state.keys.onKeyUp(event);
      this.keysUpdatedEvent();
    });
    window.addEventListener("resize", (event) => {
      this.updateDimensions();
    });
    this.page.addEventListener("wheel", (event) => {
      this.onScroll(event);
    });

    // After loading page is mounted we start the game engine
    this.state.keys = new Keys();

    this.state.physics = new Physics(
      this.state.initState,
      this.getKeys.bind(this),
      this.updateState.bind(this),
      this.onReady.bind(this)
    );

    this.state.gameState = this.state.physics.getState();
    this.state.isDead = true;
  }

  keysUpdatedEvent() {
    if (this.state.keys.CLIENT_META.escActive != this.state.escKeyPressed) {
      this.state.physics.pause(
        !this.state.gameState.physicsStats.gameStatus.paused
      );
      this.state.escKeyPressed = this.state.keys.CLIENT_META.escActive;
    }
  }

  onMouseDown(event) {
    event.preventDefault();
    this.state.keys.onMouseDown();
  }

  onMouseUp(event) {
    event.preventDefault();
    this.state.keys.onMouseUp();
  }

  onContextMenu(event) {
    event.preventDefault();
    if (!this.state.physics) return;
    if (this.state.gameState.physicsStats.gameStatus.paused) return;
    this.state.physics.state.shiftStockId++;
    // NOTE: It is important to call into the keys since browser also registers
    // right click as "onMouseDown".
    //this.state.keys.onRightClickDown();
    // NOTE: We release right click immediately once the value is queried by the physics,
    // so there is no reason to do it here.
    //setTimeout(() => this.state.keys.onRightClickUp(), 100);
  }

  onClick(event) {
    //event.preventDefault();
    if (!this.state.physics) return;
    if (this.state.gameState.physicsStats.gameStatus.paused) return;
    this.state.physics.state.clicks++;
    // NOTE: It is important to call into the keys since browser also registers
    // right click as "onMouseDown".
    //this.state.keys.onRightClickDown();
    // NOTE: We release right click immediately once the value is queried by the physics,
    // so there is no reason to do it here.
    //setTimeout(() => this.state.keys.onRightClickUp(), 100);
  }

  onScroll(event) {
    //event.preventDefault();
    //console.log(event);
    if (!this.state.physics) return;
    if (this.state.gameState.physicsStats.gameStatus.paused) return;
    if (event.deltaY > 0) {
      this.state.physics.state.shiftStockId++;
    } else {
      this.state.physics.state.shiftStockId--;
    }
    //this.state.keys.onRightClickDown();
  }

  onReady() {
    this.updateDimensions();
    this.setState({ loading: false });
  }

  updateDimensions(/* event */) {
    let w = window.innerWidth;
    let h = window.innerHeight;
    this.setState({
      windowScale: getScale(w, h, 1),
      windowLeft: getLeft(w, h, 1),
      windowBottom: getBottom(w, h, 1),
    });
    // NOTE: This is required cause otherwise mouse is not set initially!
    if (this.frame == undefined) {
      setTimeout(() => {
        this.updateDimensions();
      }, 50);
      return;
    }
    let rect = this.frame.getBoundingClientRect();
    this.setState({
      frameLeftX: rect.left,
      frameBottomY: rect.bottom,
    });
    // NOTE: For some reason rectangle is not getting set properly on startup
    // so we update it several times on startup to set mouse properly.
    // NOTE2: And just in case also update it in 1 second to avoid any delays
    this.frameInitCount++;
    if (this.frameInitCount < 3) {
      setTimeout(() => {
        this.updateDimensions();
      }, 50);
    } else if (this.frameInitCount == 3) {
      setTimeout(() => {
        this.updateDimensions();
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.periodicUpdateTimeout != undefined)
      clearTimeout(this.periodicUpdateTimeout);
    window.removeEventListener("keydown", (event) => {
      event.preventDefault();
      this.state.keys.onKeyDown(event);
    });
    window.removeEventListener("keyup", (event) => {
      event.preventDefault();
      this.state.keys.onKeyUp(event);
    });
    window.removeEventListener("resize", (event) => {
      this.updateDimensions();
    });
  }

  // NOTE: When esc is active we do not pass keys to the physics engine
  getKeys() {
    return this.state.keys;
  }

  moveCamera(state) {
    // Update the world offset to make player show in the middle
    let player = state.player;

    if (player == undefined) return {};

    // To keep camera around the player
    let moveX = -player.getRightX() + getFrameWidth(this.state.zoomOut) / 2;

    // linear move formula
    /*
    let x1 = 0;
    let y1 = 5;
    let x2 = state.worldHeight - player.getH();
    let y2 = frameHeight - player.getH() - 5;
    let x = player.getBottomY();
    let moveY = -x + (y1 + ((x - x1) * (y2 - y1)) / (x2 == x1 ? 1 : x2 - x1));
    */
    // Move y in the same way we move X
    let moveY = -player.getTopY() + getFrameHeight(this.state.zoomOut) / 2;

    // To avoid going too far left/right
    var border = 85;
    var borderFloor = 35;
    moveX = Math.min(border, moveX);
    moveX = Math.max(
      moveX,
      -(state.worldWidth - getFrameWidth(this.state.zoomOut) + border)
    );

    moveY = Math.min(borderFloor, moveY);
    moveY = Math.max(
      moveY,
      -(state.worldHeight - getFrameHeight(this.state.zoomOut) + border)
    );

    // Take into account sitting
    //moveY +=
    //  (state.physicsStats.gravityG > 0 ? 1 : -1) * this.state.sittingOffset;

    let shiftX = moveX - this.state.worldLeftX;
    let shiftY = moveY - this.state.worldBottomY;

    this.setState({ worldLeftX: moveX, worldBottomY: moveY });
    return { x: shiftX, y: shiftY };
  }

  updateSittingOffset() {
    if (this.sittingTime == undefined) this.sittingTime = GetTime();
    let oldTime = this.sittingTime;
    let newTime = GetTime();
    if (
      this.state.keys != undefined &&
      this.state.keys.downKey &&
      !this.state.escKeyPressed &&
      !this.state.chatActive
    ) {
      this.state.sittingOffset += (newTime - oldTime) * 1;
      this.state.sittingOffset = Math.min(100, this.state.sittingOffset);
    } else if (this.state.sittingOffset != 0) {
      this.state.sittingOffset -=
        Math.min((newTime - oldTime) * 1, this.state.sittingOffset) *
        (this.state.sittingOffset > 0 ? 1 : -1);
    }
    this.sittingTime = newTime;
  }

  updateZoomOut() {
    // Uncomment if zoom is needed.
    return;
    if (this.zoomTime == undefined) this.zoomTime = GetTime();
    let oldZoom = this.state.zoomOut;
    let oldTime = this.zoomTime;
    let newTime = GetTime();
    let zoomCoef = 0.005;
    if (this.state.keys != undefined && this.state.keys.CLIENT_META.zoomKey) {
      this.state.zoomOut += (newTime - oldTime) * zoomCoef;
      this.state.zoomOut = Math.min(maxZoom, this.state.zoomOut);
    } else if (this.state.zoomOut != minZoom) {
      this.state.zoomOut = Math.max(
        this.state.zoomOut - (newTime - oldTime) * zoomCoef,
        minZoom
      );
    }
    this.zoomTime = newTime;

    if (oldZoom != this.state.zoomOut) this.updateDimensions();
  }

  updateState(state) {
    if (state.player != undefined) {
      this.setState({
        isDead: state.player.stats.isDead,
      });
    }
    if (state.physicsStats.gameStatus.paused) {
      this.state.gameState = state;
      //this.setState({ gameState: state });
      this.setState({});
      return;
    }

    if (this.state.firstTimeGame) this.state.firstTimeGame = false;

    this.updateSittingOffset();
    this.updateZoomOut();

    let shift = this.moveCamera(state);
    if (shift.x == undefined) {
      shift.x = 0;
      shift.y = 0;
    }
    //this.setState({ gameState: state });
    this.state.gameState = state;
    this.state.gameState.player.sprite.avatar = this.state.activeAvatar;
    this.setState({});
  }

  state = {
    firstTimeGame: true,
    physics: undefined,
    gameState: undefined,
    keys: undefined,
    frameLeftX: 0,
    frameBottomY: 0,
    worldLeftX: 0,
    worldBottomY: 0,
    windowScale: 1,
    windowLeft: 0,
    windowBottom: 0,
    loading: true,
    isDead: undefined,
    stopInitiated: false,
    sittingOffset: 0,
    zoomOut: minZoom,
    escKeyPressed: false,
    firstLoad: true,
    activeAvatar: "scott",
    scales: {},
    initState: { playerInfo: { playerName: "xxx", avatar: "xxx" } },
    tabSelected: "avatars",
  };

  updateMenuPlayers() {
    let show_menu =
      !this.state.gameState ||
      this.state.isDead ||
      (this.state.gameState.physicsStats.gameStatus.paused &&
        !this.state.gameState.physicsStats.gameStatus.winner);
    if (show_menu) {
      for (let key in this.avatars) {
        this.avatars[key].sprite.update(50);
      }
      this.setState({});
    }
    setTimeout(this.updateMenuPlayers.bind(this), 40);
  }

  renderMenu() {
    let show_menu =
      !this.state.gameState ||
      this.state.isDead ||
      (this.state.gameState.physicsStats.gameStatus.paused &&
        !this.state.gameState.physicsStats.gameStatus.winner);
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(23, 23, 23, 0.7)",
          pointerEvents: show_menu,
          opacity: show_menu ? 1 : 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 1200,
            height: show_menu && !this.state.firstLoad ? 600 : 0,
            backgroundColor: "#c3c3c3",
            borderRadius: 10,
            overflow: "hidden",
            outline: "5px solid #1a1919",
            transition: "width 0.4s ease-in-out, height 0.4s ease-in-out",
            cursor: "initial",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 100,
              top: 0,
              left: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#bababa",
              color: "#2d2d2d",
              fontFamily: "JotiOne-Regular",
              fontSize: 40,
              outline: "5px solid #000000",
            }}
          >
            {this.state.firstTimeGame ? (
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  //alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: "50%",
                    marginRight: 30,
                  }}
                >
                  {"Welcome to"}
                </div>
                <div
                  style={{
                    position: "relative",
                    height: "50%",
                    outline: "3px solid #5d5d5d",
                    borderRadius: 5,
                    paddingLeft: 20,
                    paddingRight: 20,
                    backgroundColor: "#e7dfc0",
                    color: "#434343",
                  }}
                >
                  {"Stock Runner: 2023"}
                </div>
                <div
                  style={{
                    position: "relative",
                    height: "50%",
                    marginLeft: 20,
                  }}
                >
                  {"!"}
                </div>
              </div>
            ) : this.state.isDead ? (
              this.state.gameState.message
            ) : (
              "Game Paused"
            )}
          </div>
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left:
                this.state.tabSelected == "about"
                  ? "-100%"
                  : this.state.tabSelected == "controls"
                  ? "100%"
                  : 0,
              transition: "left ease-in-out 0.2s",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: 300,
                top: 187,
                left: 0,
                //backgroundColor: "#e47878",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 240,
                  top: 20,
                  left: 30,
                  //backgroundColor: "#e0e0e0",
                  //outline: "5px solid #4c4c4c",
                  //borderRadius: 5,
                  padding: 20,
                  color: "#2d2d2d",
                  fontFamily: "DenkOne-Regular",
                  fontSize: 30,
                }}
              >
                {
                  "Pick an avatar. Right choice is very important. For the rendering engine."
                }
              </div>
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 240,
                  top: 20,
                  right: 30,
                  //backgroundColor: "#e0e0e0",
                  //outline: "5px solid #4c4c4c",
                  //borderRadius: 5,
                  padding: 20,
                  color: "#2d2d2d",
                  fontFamily: "DenkOne-Regular",
                  fontSize: 30,
                }}
              >
                {
                  "By the way, you can always switch midgame. Just like in real life."
                }
              </div>
              {Object.keys(this.avatars).map((key, id) => {
                return (
                  <div
                    key={key}
                    style={{
                      position: "absolute",
                      top: 10,
                      left: id * 300 + 330,
                      width: 240,
                      height: 240,
                      backgroundColor: "#d7d7d7",
                      outline:
                        this.state.activeAvatar == key
                          ? "6px solid rgb(147, 17, 0)"
                          : "4px solid rgb(69, 69, 69)",
                      borderRadius: 10,
                      transition: "transform ease-in-out 0.15s",
                      boxShadow: "inset 0px -15px 2px 10px #8c8d9d",
                      transform:
                        this.state.scales[key] == undefined
                          ? ""
                          : "scale(" + this.state.scales[key] + ")",
                      cursor: "grab",
                    }}
                    onMouseEnter={() => {
                      this.state.scales[key] = 1.1;
                      this.setState({ scales: this.state.scales });
                    }}
                    onMouseLeave={() => {
                      this.state.scales[key] = 1;
                      this.setState({ scales: this.state.scales });
                    }}
                    onClick={() => {
                      this.setState({ activeAvatar: key });
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 160,
                        height: 240,
                        top: 0,
                        left: 40,
                      }}
                    >
                      {RenderPlayer(this.avatars[key])}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "80%",
                  height: 255,
                  top: 190,
                  left: "10%",
                  backgroundColor: "#e0e0e0",
                  outline: "5px solid #4c4c4c",
                  borderRadius: 5,
                  padding: 20,
                  paddingLeft: 30,
                  color: "#2d2d2d",
                  fontFamily: "Iceland-Regular",
                  fontSize: 32,
                }}
              >
                <div style={{ position: "relative" }}>
                  {
                    "Ahoy runner. What can we say, 2022 was not that bad, right? Wrong."
                  }
                </div>
                <div style={{ marginTop: -7, position: "relative" }}>
                  {
                    "It was the worst. But don't worry, as many other hodlers, you find"
                  }
                </div>
                <div style={{ marginTop: -7, position: "relative" }}>
                  {
                    "yourself in a world where stocks can get you through, get you to the"
                  }
                </div>
                <div style={{ marginTop: -7, position: "relative" }}>
                  {
                    "bright, full of hope 2023. Or at least to the moon. But remember,"
                  }
                </div>
                <div style={{ marginTop: -7, position: "relative" }}>
                  {
                    "choose wisely, burning flames of 2022 are right behind you. Godspeed!"
                  }
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: "-100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "80%",
                  height: 255,
                  top: 190,
                  left: "10%",
                  backgroundColor: "#e0e0e0",
                  outline: "5px solid #4c4c4c",
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: 175,
                    top: 25,
                    left: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#2d2d2d",
                    fontFamily: "JotiOne-Regular",
                    fontSize: 40,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: 55,
                      height: 55,
                      top: -5,
                      left: 20,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"A"}
                    <div
                      style={{
                        position: "absolute",
                        left: 75,
                        width: 200,
                        color: "#5f5f5f",
                      }}
                    >
                      {"run left"}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: 80,
                      height: 55,
                      top: -5,
                      left: 320,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"ESC"}
                    <div
                      style={{
                        position: "absolute",
                        left: 100,
                        width: 400,
                        color: "#5f5f5f",
                      }}
                    >
                      {"pause / resume"}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: 55,
                      height: 55,
                      top: 75,
                      left: 20,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"W"}
                    <div
                      style={{
                        position: "absolute",
                        left: 75,
                        width: 200,
                        color: "#5f5f5f",
                      }}
                    >
                      {"jump"}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: 270,
                      height: 55,
                      top: 75,
                      left: 320,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"R CLICK / SCROLL"}
                    <div
                      style={{
                        position: "absolute",
                        left: 290,
                        width: 600,
                        color: "#5f5f5f",
                      }}
                    >
                      {"iterate through stocks"}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: 55,
                      height: 55,
                      top: 155,
                      left: 20,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"D"}
                    <div
                      style={{
                        position: "absolute",
                        left: 75,
                        width: 200,
                        color: "#5f5f5f",
                      }}
                    >
                      {"run right"}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: 155,
                      height: 55,
                      top: 155,
                      left: 320,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#2d2d2d",
                      fontFamily: "PasseroOne-Regular",
                      fontSize: 35,
                      outline: "4px solid #4c4c4c",
                      borderRadius: 5,
                      backgroundColor: "#fcf5df",
                    }}
                  >
                    {"L CLICK"}
                    <div
                      style={{
                        position: "absolute",
                        left: 175,
                        width: 200,
                        color: "#5f5f5f",
                      }}
                    >
                      {"select stock"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              width: "100%",
              bottom: 0,
              left: 0,
              height: 150,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //backgroundColor: "#ddb5b5",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 500,
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 250,
                  bottom: 0,
                  left: 0,
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  text={this.state.isDead ? "START" : "RESTART"}
                  active={true}
                  onClick={
                    show_menu
                      ? () =>
                          setTimeout(() => this.state.physics.restartGame(), 50) // we need this timeout otherwise click event immediately causes a click
                      : () => {}
                  }
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  width: 250,
                  bottom: 0,
                  left: 250,
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  text="RESUME"
                  active={!this.state.isDead}
                  onClick={
                    show_menu
                      ? () =>
                          setTimeout(() => this.state.physics.pause(false), 50)
                      : () => {}
                  }
                />
              </div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              width: "10%",
              height: 50,
              top: 120,
              left: "30%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color:
                this.state.tabSelected == "controls" ? "#ffea80" : "#4e4e4e",
              fontFamily: "PasseroOne-Regular",
              fontSize: 30,
              transform:
                this.state.tabHovered == "controls"
                  ? "scale(1.2)"
                  : this.state.tabSelected == "controls"
                  ? "scale(1.1)"
                  : "",
              transition: "transform ease-in-out 0.1s",
              cursor: "grab",
            }}
            onMouseEnter={() => {
              this.setState({ tabHovered: "controls" });
            }}
            onMouseLeave={() => {
              this.setState({ tabHovered: "" });
            }}
            onClick={() => {
              this.setState({ tabSelected: "controls" });
            }}
          >
            {"CONTROLS"}
          </div>
          <div
            style={{
              position: "absolute",
              width: "10%",
              height: 50,
              top: 120,
              left: "45%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //backgroundColor: "blue",
              color:
                this.state.tabSelected == "avatars" ? "#ffea80" : "#4e4e4e",
              fontFamily: "PasseroOne-Regular",
              fontSize: 30,
              transform:
                this.state.tabHovered == "avatars"
                  ? "scale(1.2)"
                  : this.state.tabSelected == "avatars"
                  ? "scale(1.1)"
                  : "",

              transition: "transform ease-in-out 0.1s",
              cursor: "grab",
            }}
            onMouseEnter={() => {
              this.setState({ tabHovered: "avatars" });
            }}
            onMouseLeave={() => {
              this.setState({ tabHovered: "" });
            }}
            onClick={() => {
              this.setState({ tabSelected: "avatars" });
            }}
          >
            {"AVATARS"}
          </div>
          <div
            style={{
              position: "absolute",
              width: "10%",
              height: 50,
              top: 120,
              left: "60%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: this.state.tabSelected == "about" ? "#ffea80" : "#4e4e4e",
              fontFamily: "PasseroOne-Regular",
              fontSize: 30,
              // backgroundColor: "blue",
              transform:
                this.state.tabHovered == "about"
                  ? "scale(1.2)"
                  : this.state.tabSelected == "about"
                  ? "scale(1.1)"
                  : "",

              transition: "transform ease-in-out 0.1s",
              cursor: "grab",
            }}
            onMouseEnter={() => {
              this.setState({ tabHovered: "about" });
            }}
            onMouseLeave={() => {
              this.setState({ tabHovered: "" });
            }}
            onClick={() => {
              this.setState({ tabSelected: "about" });
            }}
          >
            {"ABOUT"}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div
        ref={(node) => {
          this.page = node;
        }}
        style={pageStyle}
        // onMouseDown and onMouseUp is only useful for continuous activity like shooting
        //onMouseDown={(event) => this.onMouseDown(event)}
        //onMouseUp={(event) => this.onMouseUp(event)}
        onClick={(event) => this.onClick(event)}
        onContextMenu={(event) => this.onContextMenu(event)}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            backgroundColor: "black",
          }}
        />
        <div
          ref={(node) => {
            this.frame = node;
          }}
          style={{
            ...globalHolderStyle,
            width: getFrameWidth(1),
            height: getFrameHeight(1),
            transform: "scale(" + this.state.windowScale + ")",
            left: this.state.windowLeft,
            bottom: this.state.windowBottom,
          }}
        >
          {this.state.gameState == undefined ? (
            <div />
          ) : this.state.gameState.physicsStats.gameStatus.winner ? (
            <Winner
              trades={this.state.gameState.player.stats.stockChanges}
              activeAvatar={this.state.activeAvatar}
            />
          ) : (
            <div>
              <div
                style={{
                  ...frameStyle,
                  width: getFrameWidth(this.state.zoomOut),
                  height: getFrameHeight(this.state.zoomOut),
                  transform: "scale(" + 1 / this.state.zoomOut + ")",
                  left: getLeft(
                    getFrameWidth(1),
                    getFrameHeight(1),
                    this.state.zoomOut
                  ),
                  bottom: getBottom(
                    getFrameWidth(1),
                    getFrameHeight(1),
                    this.state.zoomOut
                  ),
                }}
              >
                <GameFrame
                  gameState={{
                    ...this.state.gameState,
                    frameWidth: getFrameWidth(this.state.zoomOut), // TODO: This is for render optimization
                    frameHeight: getFrameHeight(this.state.zoomOut),
                    zoomOut: this.state.zoomOut,
                  }}
                  worldLeftX={this.state.worldLeftX}
                  worldBottomY={this.state.worldBottomY}
                />
              </div>
              <HighBar gameState={this.state.gameState} />
              <LowBar gameState={this.state.gameState} />
            </div>
          )}
          {<GameUi gameState={this.state.gameState} />}
          {this.renderMenu()}
        </div>
      </div>
    );
  }
}

export default GamePlay;
