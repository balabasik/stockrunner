import React, { Component } from "react";
import { GetRand, GetTime } from "./utils";
import { RenderPlayer } from "./gameFrame";
import Player from "./player";

const pageWidth = 2160;
const pageHeight = 1080;

const winnerPageStyle = {
  position: "absolute",
  width: 2160,
  height: 1080,
  backgroundColor: "rgba(39, 35, 121, 1)",
  overflow: "hidden",
};

// Thank you futurama!
const catchPhrases = [
  "Winner winner, chicken dinner",
  "Soon to be a major religion",
  "Not a substitute for human interaction",
  "When you see the robot, drink!",
  "Tell your parents it's educational",
  "Featuring gratuitous alien nudity",
];

function RenderBeam(beam, index) {
  let h = 1500;
  return (
    <div
      key={index}
      style={{
        opacity: "0.8",
        position: "absolute",
        left:
          pageWidth / 2 - beam.w / 2 + (h / 2) * Math.sin(beam.rotate / 57.325),
        bottom: 0 - (h / 2 - (h / 2) * Math.cos(beam.rotate / 57.325)),
        width: beam.w,
        height: h,
        transform: "rotate(" + beam.rotate + "deg)",
        backgroundColor: beam.color,
        boxShadow: beam.shadow,
      }}
    />
  );
}

function CreateBeam(width, deg, color) {
  return {
    w: width,
    rotate: deg,
    color: color,
    shadow: `0 0 ${Math.max(10, Math.floor(width / 4))}px ${Math.max(
      10,
      Math.floor(width / 4)
    )}px white, inset 0 0 ${Math.max(10, Math.floor(width / 4))}px ${Math.max(
      10,
      Math.floor(width / 4)
    )}px white`,
  };
}

function ModifyWidth(w) {
  return Math.min(
    200,
    Math.max(10, w + (GetRand(2) == 0 ? 1 : -1) * GetRand(50))
  );
}

class Winner extends Component {
  constructor(props) {
    super(props);
    this.dynamicActive = true;
    this.phrase = catchPhrases[GetRand(catchPhrases.length)];

    let ramona = new Player();
    ramona.stats.isDead = false;
    ramona.sprite.avatar = "ramona";
    let scott = new Player();
    scott.stats.isDead = false;
    scott.sprite.avatar = "scott";

    this.avatars = { scott, ramona };
    this.activeAvatar = props.activeAvatar;
    this.trades = props.trades;
  }

  state = {
    beams: [],
  };

  componentDidMount() {
    this.dynamicActive = true;
    this.initBeams();
    this.updateBeams();
  }

  componentWillUnmount() {
    if (this.timeout != undefined) clearTimeout(this.timeout);
  }

  initBeams() {
    let n = 61;
    let deg = 360 / (n - 1);
    for (let i = 0; i < n; i++) {
      let width = 10 + GetRand(100);
      let beam = CreateBeam(width, (-n + 1 + i) * deg, "rgb(126, 209, 255)");
      this.state.beams.push(beam);
    }
    this.setState({ beams: this.state.beams });
  }

  updateBeams() {
    if (!this.dynamicActive) return;
    let angle = 2;
    let newBeams = [];
    for (let i = 0; i < this.state.beams.length; i++) {
      newBeams.push(
        CreateBeam(
          ModifyWidth(this.state.beams[i].w),
          this.state.beams[i].rotate + angle,
          this.state.beams[i].color
        )
      );
    }

    this.setState({ beams: newBeams });
    this.timeout = setTimeout(this.updateBeams.bind(this), 250);
  }

  render() {
    let podium = (
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 60,
          width: "100%",
          height: 300,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            fontFamily: "Iceland-Regular",
            fontSize: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {"2022"}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "50%",
            width: 800,
            height: 20,
            borderRadius: 20,
            transform: "rotate(10deg) translate(-380px,80px)",
            backgroundColor: "red",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "50%",
            width: 800,
            height: 20,
            borderRadius: 20,
            transform: "rotate(-10deg) translate(-384px,-55px)",
            backgroundColor: "red",
          }}
        />
      </div>
    );

    let catchPhrase = (
      <div
        style={{
          position: "absolute",
          left: pageWidth / 2 - 1000 / 2,
          bottom: 330,
          width: 1000,
          height: 100,
          outline: "5px solid #343434",
          borderRadius: 8,
          backgroundColor: "rgb(255, 213, 131)",
          fontSize: 40,
          fontFamily: "JotiOne-Regular",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {"2023: " + this.phrase}
      </div>
    );

    let numTrades = (
      <img
        style={{
          position: "absolute",
          left: pageWidth / 2 - 600 / 2,
          top: 280,
          width: 600,
          height: 120,
        }}
        src="stars.png"
      />
    );
    let seconds = this.props.gameTime;
    let mm = Math.floor(seconds / 60 / 1000) % 100;
    if (mm < 10) mm = "0" + mm;
    let ss = Math.floor(seconds / 1000) % 60;
    if (ss < 10) ss = "0" + ss;

    return (
      <div style={winnerPageStyle}>
        {this.state.beams.map((beam, index) => RenderBeam(beam, index))}
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 240,
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "200%",
              height: "100%",
              top: 0,
              left: "-200%",
              fontSize: 60,
              fontFamily: "JotiOne-Regular",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              //backgroundColor: "blue",
            }}
          >
            {mm + " : " + ss}
          </div>
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 200,
              top: -25,
              left: "135%",
              sbackgroundColor: "#ff0000",
            }}
          >
            <img
              src={"./perk_bitcoin.png"}
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: 120,
                height: 120,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 140,
                top: 80,
                width: 120,
                height: 120,
                fontSize: 60,
                fontFamily: "JotiOne-Regular",
                display: "flex",
                alignItems: "center",
                //justifyContent: "center",
              }}
            >
              {"X" + this.props.bitcoins}
            </div>
          </div>
          {RenderPlayer(this.avatars[this.activeAvatar])}
        </div>
        <div
          style={{
            position: "absolute",
            left: pageWidth / 2 - 1400 / 2,
            top: 150,
            width: 1400,
            height: 120,
            fontSize: 60,
            fontFamily: "JotiOne-Regular",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e80000",
          }}
        >
          {"YOU MADE IT! CONGRATULATIONS!"}
        </div>
        {podium}
        {catchPhrase}
        {numTrades}
      </div>
    );
  }
}

export default Winner;
