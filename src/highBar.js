import React, { Component } from "react";

const highBarStyle = {
  height: 80,
  width: "100%",
  position: "absolute",
  top: 0,
  left: 0,
};

class HighBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let timer = 1000;

    return <div style={highBarStyle}></div>;
  }
}

export default HighBar;
