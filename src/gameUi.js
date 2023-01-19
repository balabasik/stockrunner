import React, { Component } from "react";
import "./fonts.css";
import { leftGearLetters, rightGearLetters } from "./gameState";

function GetPx(x) {
  return Math.floor(x) + "px";
}

function GetSvgRect(g) {
  let children = g.getElementsByTagName("rect");
  if (children.length > 0) return children[0];
  return undefined;
}

class GameUi extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    leftGearAngle: 0,
    rightGearAngle: 0,
    timer: { x: 0, y: 0, w: 0, h: 0, value: 59 },
    rank: { x: 0, y: 0, w: 0, h: 0, value: 1 },
    exp: { x: 0, y: 0, w: 0, h: 0, value: 70 },
    hp: { x: 0, y: 0, w: 0, h: 0, value: 50 },
    code: { x: 0, y: 0, w: 0, h: 0, value: 1 },
    stock: { x: 0, y: 0, w: 0, h: 0, value: 1 },
    progress: { x: 0, y: 0, w: 0, h: 0, value: 70 },
    filteredStocks: ["GGG", "GTRE", "GHUT", "GKJH"],
  };

  onClick() {
    /*
    this.dirLeftGearClock = !this.dirLeftGearClock;
    this.rightGearMode = "press";
    this.animateLeftGear();
    this.animateRightGear();*/
  }

  setupBox(name, src) {
    let boxSvg = this.gameuiSvg.getElementById(src);
    //x="1099.3" y="953.3" width="107.7" height="107.7"
    this.state[name] = {
      x: boxSvg.getAttribute("x"),
      y: boxSvg.getAttribute("y"),
      w: boxSvg.getAttribute("width"),
      h: boxSvg.getAttribute("height"),
      value: this.state[name].value,
    };
    this.setState(this.state);
  }

  setupRank() {
    let boxSvg = this.gameuiSvg.getElementById("gameui-rank-textbox");
    //x="1099.3" y="953.3" width="107.7" height="107.7"
    this.state.rank = {
      x: boxSvg.getAttribute("x"),
      y: boxSvg.getAttribute("y"),
      w: boxSvg.getAttribute("width"),
      h: boxSvg.getAttribute("height"),
      value: this.state.rank.value,
    };
    this.setState(this.state);
    let bgSvg = this.gameuiSvg.getElementById("gameui-rank");
    // NOTE: For some components illustrator creates group wrapper around rect
    // NOTE: Illustrator exports first rect as the one with fill, and second is for border.
    this.rankBg = GetSvgRect(bgSvg);
    //this.rankBg.setAttribute("style", "fill: yellow");
  }

  setupBoxes() {
    for (let i = 0; i <= 4; i++) {
      let boxLeft = GetSvgRect(
        this.gameuiSvg.getElementById(
          i == 0 ? "gameui-bottom-left-textbox" : "gameui-bottom-left-box" + i
        )
      );
      this.state.leftBoxes[i == 0 ? "textbox" : "box" + i] = {
        x: boxLeft.getAttribute("x"),
        y: boxLeft.getAttribute("y"),
        h: boxLeft.getAttribute("height"),
        w: boxLeft.getAttribute("width"),
      };
    }

    for (let i = 0; i <= 4; i++) {
      let boxRight = GetSvgRect(
        this.gameuiSvg.getElementById(
          i == 0 ? "gameui-bottom-right-textbox" : "gameui-bottom-right-box" + i
        )
      );
      this.state.rightBoxes[i == 0 ? "textbox" : "box" + i] = {
        x: boxRight.getAttribute("x"),
        y: boxRight.getAttribute("y"),
        h: boxRight.getAttribute("height"),
        w: boxRight.getAttribute("width"),
      };
    }

    this.setState({
      leftBoxes: this.state.leftBoxes,
      rightBoxes: this.state.rightBoxes,
    });
  }

  onGameuiSvgLoaded() {
    this.gameuiSvg = document.getElementById("gameui-svg").contentDocument;
    this.setupBox("stock", "gameui-bottom-shelf");
    //this.setupSpells();
    this.setupRank();
    //this.setupBoxes();
    this.setupBox("timer", "gameui-timer-textbox");
    //this.setupBox("hp", "gameui-hp-box");
    this.setupBox("exp", "gameui-exp-box");
    this.setupBox("progress", "gameui-progress-box");
    this.setupBox("code", "gameui-code-textbox");
  }

  getSelectedStockId() {
    if (!this.props.gameState) return 0;
    let value = Math.floor(
      this.props.gameState.stockFilter.length / 2 +
        this.props.gameState.shiftStockId
    );
    while (value < 0) {
      value += this.props.gameState.stockFilter.length;
    }
    this.translateTransitionEnabled =
      value % this.props.gameState.stockFilter.length != 0 &&
      value % this.props.gameState.stockFilter.length !=
        this.props.gameState.stockFilter.length - 1;
    return value % this.props.gameState.stockFilter.length;
  }

  renderStock() {
    let transform =
      !this.props.gameState || this.props.gameState.stockFilter.length < 10
        ? 0
        : "translateX(" +
          -Math.floor(this.getSelectedStockId() - 4) * 130 +
          "px)";
    return (
      <div
        style={{
          height: GetPx(this.state.stock.h),
          width: GetPx(this.state.stock.w),
          position: "absolute",
          left: GetPx(this.state.stock.x),
          top: GetPx(this.state.stock.y),
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            height: "60%",
            marginTop: -17,
            width: 1200,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#d0d0d0",
            outline: "3px solid #5f5f5f",
            borderRadius: 3,
          }}
        >
          {!this.props.gameState ? (
            <></>
          ) : (
            <div
              style={{
                height: "100%",
                width:
                  this.props.gameState.stockFilter.length * (120 + 10) + 10,
                position: "relative",
                //overflow: "hidden",
                //transform: transform, # NOTE: transform here is not getting updated since element is static.
                //display: "flex",
                //justifyContent: "center",
                //alignItems: "center",
                //backgroundColor: "#fa4646",
                /*transition: this.translateTransitionEnabled
                  ? "transform ease-in-out 0.1s"
                  : "",*/
              }}
            >
              {this.props.gameState.stockFilter.map((stock, id) => (
                <div
                  key={stock + "_" + id}
                  style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    transform: transform,
                  }}
                >
                  {[-1, 0, 1].map((i) =>
                    this.props.gameState.stockFilter.length >= 9 || i == 0 ? (
                      <div
                        key={id + "" + i}
                        style={{
                          position: "absolute",
                          width: 120,
                          top: "10%",
                          height: "80%",
                          left:
                            10 +
                            (120 + 10) * id +
                            i * this.props.gameState.stockFilter.length * 130,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                          fontSize: this.getSelectedStockId() == id ? 30 : 25,
                          fontFamily: "Slackey-Regular",
                          color: "#3e3e3e",
                          outline:
                            this.getSelectedStockId() == id
                              ? "solid #464646 3px"
                              : "",
                          backgroundColor:
                            stock == this.props.gameState.symbol
                              ? "#ffffa1"
                              : this.getSelectedStockId() == id
                              ? "#e5d7ff"
                              : "#b6b6b6",
                          paddingLeft: 20,
                          paddingRight: 20,
                          marginLeft: 10,
                          borderRadius: 5,
                          transform:
                            this.getSelectedStockId() == id
                              ? "scale(1.05)"
                              : "",
                          transition: "transform ease-in-out 0.3s",
                        }}
                      >
                        {stock.toUpperCase()}
                      </div>
                    ) : (
                      <div key={id + "" + i} />
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  renderTimer() {
    let date = this.getDate();
    return (
      <div
        style={{
          height: GetPx(this.state.timer.h - 6), // borderWidth
          width: GetPx(this.state.timer.w),
          position: "absolute",
          left: GetPx(this.state.timer.x),
          top: GetPx(this.state.timer.y),
          overflow: "hidden",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          fontSize: GetPx(this.state.timer.w / 4),
          fontFamily: "DenkOne-Regular",
        }}
      >
        {date[0] + " " + date[1]}
      </div>
    );
  }

  renderCode() {
    return (
      <div
        style={{
          height: GetPx(this.state.code.h),
          width: GetPx(this.state.code.w),
          position: "absolute",
          left: GetPx(this.state.code.x),
          top: GetPx(this.state.code.y),
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "40px",
          fontFamily: "Slackey-Regular",
        }}
      >
        {"Stock Runner"}
      </div>
    );
  }

  renderRank() {
    return (
      <div
        style={{
          height: GetPx(this.state.rank.h - 6),
          width: GetPx(this.state.rank.w),
          position: "absolute",
          left: GetPx(this.state.rank.x),
          top: GetPx(this.state.rank.y),
          overflow: "hidden",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          fontSize: GetPx(this.state.rank.w / 3),
          fontFamily: "Iceland-Regular",
          letterSpacing: "-5px",
          textIndent: "-5px",
        }}
      >
        {this.props.gameState && this.props.gameState.ready
          ? this.props.gameState.symbol.substring(0, 4).toUpperCase()
          : "N/A"}
      </div>
    );
  }

  renderExp() {
    let playerProgress = Math.max(
      0.02,
      this.props.gameState
        ? this.props.gameState.player.getLeftX() /
            this.props.gameState.worldWidth
        : 0
    );
    let fireProgress = Math.max(
      0,
      this.props.gameState
        ? this.props.gameState.firePosX / this.props.gameState.worldWidth
        : 0
    );
    let day = this.props.gameState
      ? Math.floor(
          (365 * this.props.gameState.player.getRightX()) /
            this.props.gameState.worldWidth
        )
      : 0;
    let week = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    day = week[day % 7];
    return (
      <div
        style={{
          height: GetPx(this.state.exp.h),
          width: GetPx(this.state.exp.w),
          position: "absolute",
          left: GetPx(this.state.exp.x),
          top: GetPx(this.state.exp.y),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "80%",
            width: "19%",
            height: "125%",
            backgroundColor: "#cfcfcf",
            //border: "5px solid black",
            borderRadius: "10px",
            marginTop: "-4px",
            overflow: "hidden",
            color: "#5a5a5a",
            fontSize: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "DenkOne-Regular",
          }}
        >
          {day}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "5%",
            width: "71%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: 0,
              width: "100%",
              height: "30%",
              backgroundColor: "white",
              border: "4px solid black",
              marginTop: "-4px",
              marginLeft: "-4px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-1px",
                width: playerProgress * 100 + "%",
                height: "100%",
                backgroundColor: "rgb(52, 188, 255)",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "" + playerProgress * 100 + "%",
              width: GetPx(this.state.exp.h),
              height: GetPx(this.state.exp.h),
              borderRadius: GetPx(this.state.exp.h),
              border: "3px solid black",
              marginTop: "-3px",
              marginLeft: GetPx(-this.state.exp.h / 2),
              backgroundColor: "rgb(121, 251, 125)",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              fontSize: GetPx(this.state.exp.h * 0.7),
              fontFamily: "DenkOne-Regular",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "" + fireProgress * 100 + "%",
              width: GetPx(this.state.exp.h),
              height: GetPx(this.state.exp.h),
              borderRadius: GetPx(this.state.exp.h),
              border: "3px solid black",
              marginTop: "-3px",
              marginLeft: GetPx(-this.state.exp.h / 2),
              backgroundColor: "rgb(251, 156, 121)",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              fontSize: GetPx(this.state.exp.h * 0.7),
              fontFamily: "DenkOne-Regular",
            }}
          />
        </div>
      </div>
    );
  }

  month_names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
  ];

  getDate() {
    if (!this.props.gameState) {
      return ["Jan", 1];
    }
    let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31];
    let accum = [0];
    for (let x of months) {
      accum.push(x + accum[accum.length - 1]);
    }
    let day = Math.floor(
      (365 * this.props.gameState.player.getRightX()) /
        this.props.gameState.worldWidth
    );
    let cur_month = 0;
    while (day >= accum[cur_month + 1]) {
      cur_month++;
    }
    return [this.month_names[cur_month], day - accum[cur_month] + 1];
  }

  renderRightGear() {
    let rightGearAngle = this.props.gameState
      ? Math.floor((this.props.gameState.stockCooldown / 3000) * 90)
      : 0;
    rightGearAngle = Math.floor(rightGearAngle / 15) * 15;
    return (
      <div
        id="gameui-right-gear-things"
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 50,
            height: 50,
            right: 0,
            bottom: 0,
            color: "#000000",
            fontSize: 40,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Slackey-Regular",
            backgroundColor: "#b7afff",
            borderRadius: 5,
            outline: "2ps solid black",
          }}
        >
          {"2"}
        </div>
        <div
          style={{
            height: 400,
            width: 400,
            position: "absolute",
            right: -200,
            bottom: -200,
            overflow: "hidden",
            transform: "rotate(" + rightGearAngle + "deg)",
            transition: "transform ease-in-out 0.2s",
          }}
        >
          <img
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              bottom: 0,
            }}
            src="gear.svg"
          />
          {[-3, -2, -1, 0, 1, 2, 3].map((num, id) => {
            let active = rightGearAngle == 0;
            let r = 20;
            let x = num == 0 ? 3 * r : r;
            let y = r;
            let d = num == 0 ? r / 2 : num % 2 == 0 ? (r * 3) / 4 : 0;
            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  width: x,
                  height: y,
                  right: 85 + d + (40 - x) / 2 + 20 + 200,
                  bottom: -20 + 200 + (40 - y) / 2,
                  backgroundColor: active ? "#8fff8d" : "rgb(213, 213, 213)",
                  border: active ? "3px solid #453929" : "3px solid #5b5b5b",
                  borderRadius: r / 4,
                  transformOrigin:
                    "" +
                    (85 + 20 + d + x + (40 - x) / 2) +
                    "px " +
                    y / 2 +
                    "px", //"-12px 124px",
                  transform: "rotate(" + Math.floor((id - 1) * 22.5) + "deg)",
                  color: "black",
                  fontSize: 24,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "DenkOne-Regular",
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  renderLeftGear() {
    return (
      <div
        id="gameui-left-gear-things"
        style={{
          height: "100%",
          width: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 50,
            height: 50,
            left: 0,
            bottom: 0,
            color: "#000000",
            fontSize: 40,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Slackey-Regular",
            backgroundColor: "#b7afff",
            borderRadius: 5,
            outline: "2ps solid black",
          }}
        >
          {"1"}
        </div>
        <div
          style={{
            height: 400,
            width: 400,
            position: "absolute",
            left: -200,
            bottom: -200,
            overflow: "hidden",
            transform: this.props.gameState
              ? "rotate(" +
                Math.floor(
                  -45 + (this.props.gameState.leftGear.angle % (45 * 26))
                ) +
                "deg)"
              : "",
            //transition: "rotate ease-in-out 0.3s",
          }}
        >
          <img
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              bottom: 0,
            }}
            src="gear.svg"
          />
          {leftGearLetters.map((letter, id) => {
            id = id - 1;
            let angle =
              this.props.gameState && this.props.gameState.leftGear.angle
                ? this.props.gameState.leftGear.angle
                : 0;
            let visible =
              (angle % (45 * 26)) - id * 45 >= -90 &&
              (angle % (45 * 26)) - id * 45 < 90;
            let active =
              this.props.gameState &&
              this.props.gameState.leftGear.activeId == id;
            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  width: 60,
                  height: 60,
                  left: 100 + 200,
                  bottom: -30 + 200,
                  backgroundColor: active ? "#ffffae" : "rgb(213, 213, 213)",
                  border: active ? "4px solid #b62121" : "4px solid #5b5b5b",
                  borderRadius: 8,
                  transformOrigin: "-100px 30px", //"-12px 124px",
                  transform: "rotate(" + Math.floor(-id * 45) + "deg)",
                  color: "black",
                  fontSize: active ? 32 : 28,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "Slackey-Regular",
                  // transition: "scale ease-in-out 0.3s",
                  opacity: visible ? 1 : 0,
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderProgress() {
    let progress = this.props.gameState
      ? this.props.gameState.player.stats.bitcoins
      : 0;
    let seconds = this.props.gameState ? this.props.gameState.timeStamp : 0;
    let mm = Math.floor(seconds / 60 / 1000) % 100;
    if (mm < 10) mm = "0" + mm;
    let ss = Math.floor(seconds / 1000) % 60;
    if (ss < 10) ss = "0" + ss;
    return (
      <div
        style={{
          height: GetPx(this.state.progress.h),
          width: GetPx(this.state.progress.w),
          position: "absolute",
          left: GetPx(this.state.progress.x - 3), // border
          top: GetPx(this.state.progress.y - 2), // border
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-25%",
            left: "0%",
            width: "25%",
            height: "150%",
            backgroundColor: "#cfcfcf",
            //border: "5px solid black",
            borderRadius: "10px",
            marginTop: "-4px",
            overflow: "hidden",
            color: "#5a5a5a",
            fontSize: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "DenkOne-Regular",
          }}
        >
          {mm + " : " + ss}
        </div>
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "30%",
            width: "70%",
            height: "70%",
            backgroundColor: "white",
            border: "5px solid black",
            borderRadius: "10px",
            marginTop: "-4px",
            //overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "AudioWide-Regular",
              color: "#606060",
            }}
          >
            {"CRYPTO"}
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-1px",
              width: progress + "%",
              height: "100%",
              backgroundColor: "grey",
              borderRadius: "5px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-43%",
              left: Math.min(progress, 97) + "%",
              width: GetPx(this.state.progress.h * 1.5),
              height: GetPx(this.state.progress.h),
              borderRadius: "10px",
              border: "4px solid black",
              marginTop: "-3px",
              marginLeft: GetPx(-this.state.progress.h / 2),
              backgroundColor: "rgb(255, 241, 112)",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              flexDirection: "column",
              fontSize: GetPx(this.state.progress.h * 0.7),
              fontFamily: "DenkOne-Regular",
            }}
          >
            {progress}
          </div>
        </div>
      </div>
    );
  }

  renderBox(key, box, left) {
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left: GetPx(box.x),
          top: GetPx(box.y),
          width: GetPx(box.w),
          height: GetPx(box.h),
          backgroundColor: "rgb(207, 207, 207)",
          borderRadius: "10px",
          border: "5px solid grey",
          marginTop: "-5px",
          marginLeft: "-5px",
        }}
      />
    );
  }

  render() {
    return (
      <div
        id="gameui-all"
        style={{
          height: 1080,
          width: 2160,
          position: "absolute",
          left: 0,
          top: 0,
          //overflow: "hidden",
          outline: "5px solid black", // this is to cover small gap
          pointerEvents: "none",
        }}
      >
        {/*Object.keys(this.state.spells).map((key) => this.renderSpell(key))*/}
        {this.renderLeftGear()}
        {this.renderRightGear()}
        {this.renderTimer()}
        {this.renderRank()}
        {this.renderExp()}
        {this.renderProgress()}
        {this.renderCode()}
        {this.renderStock()}
        {/*Object.keys(this.state.leftBoxes).map((key) =>
          this.renderBox(key, this.state.leftBoxes[key], true)
    )*/}
        {/*Object.keys(this.state.rightBoxes).map((key) =>
          this.renderBox(key, this.state.rightBoxes[key], false)
)*/}
        {
          <object
            data="gameui.svg" // NOTE: inn illustrator use "export_as", and "use artboards"
            type="image/svg+xml"
            id="gameui-svg"
            width="100%"
            height="100%"
            left="0px"
            top="0px"
            onLoad={this.onGameuiSvgLoaded.bind(this)}
          />
        }
      </div>
    );
  }
}

export default GameUi;
