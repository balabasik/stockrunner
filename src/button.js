import React, { Component } from "react";

export default class Button extends Component {
  state = {
    button: "",
  };
  render() {
    return (
      <div
        style={{
          position: "absolute",
          height: 70,
          width: 200,
          borderRadius: 10,
          outline: "4px solid rgb(107, 107, 107)",
          fontFamily: "DenkOne-Regular, Denk One",
          fontSize: 30,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "rgb(103, 103, 103)",
          cursor: "grab",
          userSelect: "none",
          transition: "transform ease-in-out 0.15s",
          transform:
            "scale(" + (this.state.button == "hovered" ? 1.07 : 1) + ")",
          backgroundColor: !this.props.active
            ? "#d5d5d5"
            : this.state.button == "pressed"
            ? "rgb(218, 167, 100)"
            : this.state.button == "hovered"
            ? "rgb(245, 208, 148)"
            : "rgb(247, 228, 158)",
        }}
        onMouseEnter={() => {
          if (!this.props.active) return;
          this.setState({ button: "hovered" });
        }}
        onMouseLeave={() => {
          if (!this.props.active) return;
          this.setState({ button: "" });
        }}
        onMouseDown={() => {
          if (!this.props.active) return;
          this.setState({ button: "pressed" });
        }}
        onMouseUp={() => {
          if (!this.props.active) return;
          this.setState({ button: "hovered" });
        }}
        onClick={() => {
          if (!this.props.active) return;
          this.props.onClick();
        }}
      >
        {this.props.text}
      </div>
    );
  }
}
