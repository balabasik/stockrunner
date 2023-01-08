import React, { Component } from "react";

class Wall extends Component {
  componentDidMount() {
    //this.addStars();
    //this.update();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  state = {
    shinyPoints: [],
  };

  onSvgLoaded() {
    this.svg = document.getElementById("zigzag-svg").contentDocument;
    let lines = this.svg.querySelectorAll("polyline");

    this.lines = [];

    for (let line of lines) {
      let points = line.getAttribute("points").split(" ");
      let toAppend = [];
      for (let i = 0; i + 1 < points.length; i += 2) {
        toAppend.push([points[i], points[i + 1]]);
      }
      this.lines.push(toAppend);
    }
    this.createPoints();
    this.periodicMovePoints();
  }

  createPoints() {
    this.state.shinyPoints = [];
    let idx = 0;
    for (let line of this.lines) {
      for (let i = 0; i < line.length / 2; i += 2) {
        this.state.shinyPoints.push({
          line: idx,
          pos: line[i],
          pointId: i,
          speed: 0.5 + idx * 2,
        });
      }
      idx++;
    }
    //this.setState({});
  }

  movePoints() {
    for (let i = 0; i < this.state.shinyPoints.length; i++) {
      let point = this.state.shinyPoints[i];
      let line = this.lines[point.line];
      if (point.pointId + 1 >= line.length) {
        point.pos = line[0];
        point.pointId = 0;
      }
      let shinyPoint = point.pos;
      let nextPoint = line[point.pointId + 1];
      let dist = Math.sqrt(
        (shinyPoint[0] - nextPoint[0]) * (shinyPoint[0] - nextPoint[0]) +
          (shinyPoint[1] - nextPoint[1]) * (shinyPoint[1] - nextPoint[1])
      );
      let move = 20 * point.speed;
      while (move >= dist) {
        move -= dist;
        point.pointId++;
        point.pos = line[point.pointId];
        shinyPoint = point.pos;
        if (point.pointId + 1 >= line.length) return;
        nextPoint = line[point.pointId + 1];
        dist = Math.sqrt(
          (shinyPoint[0] - nextPoint[0]) * (shinyPoint[0] - nextPoint[0]) +
            (shinyPoint[1] - nextPoint[1]) * (shinyPoint[1] - nextPoint[1])
        );
      }
      let ratio = move / dist;
      point.pos = [
        shinyPoint[0] * (1 - ratio) + ratio * nextPoint[0],
        shinyPoint[1] * (1 - ratio) + ratio * nextPoint[1],
      ];
    }
    //console.log(this.state.shinyPoint);
    this.setState({});
  }

  periodicMovePoints() {
    this.movePoints();
    this.timeout = setTimeout(this.periodicMovePoints.bind(this), 40);
  }

  render() {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8640, //"100%",
          height: 1300, //"100%",
          backgroundColor: "#2a2723",
          filter: "blur(5px)",
        }}
      >
        <object
          data="zigzag.svg" // NOTE: in illustrator use "export_as", and "use artboards"
          type="image/svg+xml"
          id="zigzag-svg"
          width="100%"
          height="100%"
          left="0px"
          top="0px"
          onLoad={this.onSvgLoaded.bind(this)}
        />
        {this.state.shinyPoints.map((point, id) => {
          let visible =
            point.pos[0] >= this.props.frameLeft &&
            point.pos[0] < this.props.frameLeft + 2160 &&
            point.pos[1] >= this.props.frameBottom &&
            point.pos[1] < this.props.frameBottom + 1080;
          if (!visible) return;
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: point.pos[0] - 10 / 2,
                top: point.pos[1] - 10 / 2,
                width: 10,
                height: 10,
                borderRadius: 10,
                boxShadow: "0px 0px 10px 10px #ffffff",
                backgroundColor: "#ffffff",
              }}
            />
          );
        })}
      </div>
    );
  }
}

export default Wall;
