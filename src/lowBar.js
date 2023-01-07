import React, { Component } from "react";

const lowBarStyle = {
  height: 80,
  width: "100%",
  position: "absolute",
  bottom: 0,
  left: 0,
};

class LowBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div style={lowBarStyle}></div>;
  }
}

export default LowBar;
