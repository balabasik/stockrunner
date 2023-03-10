import { LoadStocks } from "./stocks/loadStocks";

const brickW = 220;

function getBoxBgStyle(imgSrc) {
  return {
    backgroundImage: `url(${imgSrc})`,
    backgroundSize: "100% 100%",
    backgroundPosition: "0px 0px",
    overflow: "hidden",
  };
}

function createPillar(state, x, y, mirror, dynamic, fake, action) {
  let transform = mirror ? "scaleY(-1)" : "";
  if (dynamic) {
    state.createDynamicBox(
      x + 5,
      mirror ? y : y - 1200,
      brickW - 5,
      1200,
      dynamic.movex,
      dynamic.movey,
      dynamic.movet,
      { ...getBoxBgStyle("pipe.png"), transform: transform },
      { sideBump: true, bottomBump: mirror }
    );
  } else {
    let fakeAttr = {};
    if (fake) {
      fakeAttr = {
        resistance: 2000,
        resistanceSpeed: 1.5,
      };
    }
    let wall = action != undefined;
    let id = state.createStaticBox(
      x + 5,
      mirror ? y : y - (wall ? 1400 : 1200),
      brickW - 5,
      wall ? 1400 : 1200,
      {
        ...getBoxBgStyle(wall ? "wall.png" : "pipe.png"),
        transform: transform,
      },
      { sideBump: true, bottomBump: mirror, ...fakeAttr }
    );
    if (action) {
      let box = state.boxes[id];
      box.stats.action = (elapsedTime, touching, distance) => {
        if (action == "goup") {
          let near = distance > -250 && distance < 250;
          if (near && box.getBottomY() < state.worldHeight * 1 - 1400) {
            box.setBottomY(box.getBottomY() + elapsedTime * 3);
          } else if (!near && box.getBottomY() > y - 1400) {
            box.setBottomY(box.getBottomY() - elapsedTime * 3);
          }
        } else if (action == "godown") {
          let near = distance > -150 && distance < 150;
          if (near && box.getBottomY() > 0.1 * state.worldHeight) {
            box.setBottomY(box.getBottomY() - elapsedTime * 3);
          } else if (!near && box.getBottomY() < y) {
            box.setBottomY(box.getBottomY() + elapsedTime * 3);
          }
        } else if (touching && action == "hide") {
          state.physicsStats.invisible = true;
        } else if (touching && action == "reveal") {
          state.physicsStats.invisible = false;
        }
      };
    }
  }
}

function createSlider(
  state,
  x,
  y,
  movex,
  movet,
  isLastSlider0,
  isLastSlider1,
  bottomBump
) {
  let id = state.createDynamicBox(
    x + 5,
    y,
    brickW - 5,
    90,
    movex,
    0,
    movet,
    { ...getBoxBgStyle("slider.png") },
    { sideBump: false, bottomBump: bottomBump }
  );
  if (isLastSlider0) {
    state.lastSlider0 = id;
  } else if (isLastSlider1) {
    state.lastSlider1 = id;
    state.boxes[id].stats.interactable = false;
    state.boxes[id].stats.style.backgroundImage = "";
  }
}

function createButton(state, x, y, action) {
  let id = state.createStaticBox(
    x + 5 + 25,
    y - 10,
    brickW - 5 - 50,
    60,
    {
      backgroundColor: "#cd4240",
      borderRadius: 12,
      outline: "6px solid black",
    },
    {}
  );
  let box = state.boxes[id];
  box.stats.action = (elapsedTime, touching) => {
    if (touching && action == "hide") {
      state.physicsStats.invisible = true;
    } else if (touching && action == "reveal") {
      state.physicsStats.invisible = false;
    }
  };
  state.createStaticBox(
    x + 5,
    y - 1200,
    brickW - 5,
    1200,
    { ...getBoxBgStyle("pipe.png") },
    { sideBump: true }
  );
}

function createBlock(state, x, inverseNear, playerCondition, lastBlock) {
  createBlockLower(state, x, inverseNear, playerCondition);
  createBlockUpper(state, x, inverseNear, playerCondition, lastBlock);
}

function createBlockLower(state, x, inverseNear, playerCondition) {
  let y = state.worldHeight * 0.1;
  let id = state.createStaticBox(
    x + 5,
    y - 450,
    brickW - 5,
    450,
    {
      ...getBoxBgStyle("block_short.png"),
    },
    { sideBump: true, resistance: 0 }
  );
  let box = state.boxes[id];
  box.stats.action = (elapsedTime, touching, distance, player) => {
    let near = distance > -100 && distance < 100;
    if (playerCondition) {
      near &= playerCondition(player);
    }
    if (inverseNear) near = !near;
    if (near && box.getBottomY() < state.worldHeight * 0.5 - 450) {
      box.setBottomY(
        Math.min(
          state.worldHeight * 0.5 - 450,
          box.getBottomY() + elapsedTime * 3
        )
      );
    } else if (!near && box.getBottomY() > y - 450) {
      box.setBottomY(Math.max(y - 1400, box.getBottomY() - elapsedTime * 3));
    }
  };
}

function createWindow(state, x) {
  state.createDynamicBox(
    x + 5,
    0.3 * state.worldHeight - 1200,
    brickW - 5,
    1200,
    0,
    330,
    1000,
    { ...getBoxBgStyle("window.png") },
    { sideBump: true }
  );
  state.createDynamicBox(
    x + 5,
    0.5 * state.worldHeight,
    brickW - 5,
    1200,
    0,
    330,
    1000,
    { ...getBoxBgStyle("window.png"), transform: "scaleY(-1)" },
    { sideBump: true }
  );
}

function createBlockUpper(
  state,
  x,
  inverseNear,
  playerCondition,
  lastBlock,
  midY
) {
  if (midY == undefined) midY = state.worldHeight * 0.5;
  let y = state.worldHeight * 0.89;
  let id = state.createStaticBox(
    x + 5,
    y,
    brickW - 5,
    450,
    {
      ...getBoxBgStyle("block_short.png"),
      transform: "scaleY(-1)",
    },
    { sideBump: true, resistance: 0 }
  );
  if (lastBlock) state.lastBlock = id;
  let box = state.boxes[id];
  box.stats.action = (elapsedTime, touching, distance, player) => {
    let near = distance > -100 && distance < 100;
    if (playerCondition) {
      near &= playerCondition(player);
    }
    if (inverseNear) near = !near;
    if (near && box.getBottomY() > midY) {
      box.setBottomY(Math.max(midY, box.getBottomY() - elapsedTime * 3));
    } else if (!near && box.getBottomY() < y) {
      box.setBottomY(Math.min(y, box.getBottomY() + elapsedTime * 3));
    }
  };
}

function getStockBoxStyle() {
  return {
    backgroundColor: "#7b96a591",
    outline: "5px solid #1b1b1b", // NOTE: not outline since it adds height
    //opacity: 0.6,
    borderRadius: 2,
  };
}

function LoadMap1(state) {
  // General map attributes
  state.worldWidth = 365 * brickW;
  state.worldHeight = 1300;
  state.floorY = 0; // should always be 0;
  state.ready = false;

  state.mapStyle = {
    back: "#dff2f5", //worldBackStyle,
    //middle: "#c8f1c7", //worldMiddleStyle,
    front: "#d4e0ae", //worldFrontStyle,
  };

  let perkPlaces = [
    [4.0, 0.7],
    [4.6, 0.7],
    [5.2, 0.7],
    [10.6, 0.83],
    [11.2, 0.83],
    [11.8, 0.83],
    [21, 0.82],
    [21, 0.72],
    [23, 0.72],
    [23, 0.82],
    [30, 0.7],
    [32, 0.65],
    [34, 0.6],
    [36, 0.55],
    [38, 0.5],
    [40, 0.45],
    [42, 0.4],
    [47, 0.83],
    [48, 0.83],
    [49, 0.83],
    [50, 0.83],
    [51, 0.83],
    [64.2, 0.83],
    [64.2, 0.73],
    [64.8, 0.83],
    [64.8, 0.73],
    [76.8, 0.37],
    [77.6, 0.29],
    [78.5, 0.27],
    [79.4, 0.29],
    [80.2, 0.37],
    [93.5, 0.8],
    [94.5, 0.7],
    [95.5, 0.8],
    [96.5, 0.7],
    [97.5, 0.8],
    [104, 0.83],
    [105, 0.83],
    [106, 0.83],
    [107, 0.83],
    [108, 0.83],
    [116, 0.83],
    [118, 0.83],
    [120, 0.83],
    [122, 0.83],
    [124, 0.83],
    [133, 0.76],
    [134, 0.76],
    [148, 0.5],
    [149, 0.5],
    [148, 0.35],
    [149, 0.35],
    [159, 0.8],
    [160, 0.8],
    [162, 0.8],
    [163, 0.8],
    [174, 0.7],
    [174, 0.65],
    [174, 0.6],
    [188, 0.57],
    [189, 0.57],
    [201, 0.5],
    [201.5, 0.4],
    [202, 0.3],
    [202.5, 0.4],
    [203, 0.5],
    [217.5, 0.8],
    [222.5, 0.8],
    [227.5, 0.8],
    [234, 0.5],
    [235, 0.5],
    [236, 0.5],
    [237, 0.5],
    [238, 0.5],
    [250, 0.7],
    [251, 0.7],
    [252, 0.7],
    [253, 0.7],
    [260.4, 0.68],
    [260, 0.58],
    [261, 0.68],
    [261.6, 0.68],
    [262, 0.58],
    [266, 0.35],
    [266, 0.25],
    [271, 0.35],
    [271, 0.25],
    [276, 0.35],
    [276, 0.25],
    [290, 0.7],
    [291, 0.6],
    [292, 0.5],
    [293, 0.4],
    [302, 0.4],
    [303, 0.4],
    [315, 0.5],
    [319, 0.5],
    [329.5, 0.6],
    [330.5, 0.7],
    [330.5, 0.5],
    [331.5, 0.6],
    [340, 0.7],
    [342, 0.6],
    [344, 0.7],
    [346, 0.6],
    [348, 0.7],
    [353, 0.1],
    [354, 0.1],
    [355, 0.1],
    [358, 0.1],
    [359, 0.1],
    [360, 0.1],
    [361, 0.1],
    [362, 0.1],
  ];
  //console.log(perkPlaces.length);
  state.perkCreationPlaces = perkPlaces.map((pair) => {
    return [
      pair[0] * brickW - brickW / 2 - 120 / 2, // perkW = 120
      pair[1] * state.worldHeight,
    ];
  });

  // 160 is player width
  //state.playerBirthPlaces = [[brickW * 362, state.worldHeight * 0.6]];
  state.playerBirthPlaces = [[brickW / 2 - 160 / 2, state.worldHeight * 0.8]];
  LoadStocks((stocks) => {
    OnStocksReady(state, stocks);
  });
}

function OnStocksReady(state, stocks) {
  state.ready = true;
  state.stocks = stocks;

  state.stockMap = {};
  for (let key in state.stocks) {
    let sub = key[0]; //key.substring(0, 2);
    if (!state.stockMap[sub]) {
      state.stockMap[sub] = [];
    }
    state.stockMap[sub].push(key);
  }

  let pillars = {
    0: { y: state.worldHeight * 0.5, mirror: false },
    7: {
      y: state.worldHeight * 0.85,
      mirror: true,
      stock: true,
    },
    8: {
      y: state.worldHeight * 0.72,
      mirror: false,
      dynamic: { movex: brickW * 5, movey: 0, movet: 5000 },
      slider: true,
      stock: true,
    },
    14: { y: state.worldHeight * 0.5, mirror: false },
    21: {
      y: state.worldHeight * 0.75,
      mirror: true,
      action: "wall",
      stock: true,
    },
    28: { y: state.worldHeight * 0.7, mirror: false },
    34: { y: state.worldHeight * 0.9, mirror: true, stock: true },
    35: { y: state.worldHeight * 0.83, mirror: true, stock: true },
    36: { y: state.worldHeight * 0.76, mirror: true, stock: true },
    37: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: brickW * 14, movey: 0, movet: 14000 },
      slider: true,
      stock: true,
    },
    42: { y: state.worldHeight * 0.3, mirror: false },
    56: { y: state.worldHeight * 0.6, mirror: true }, // hard
    62: {
      y: state.worldHeight * 0.65,
      blockUpper: true,
      inverseNear: true,
      playerCondition: (player) => {
        return (
          player.getBottomY() > state.worldHeight * 0.4 &&
          player.getBottomY() < state.worldHeight * 0.6
        );
      },
      stock: true,
    },
    65: {
      y: state.worldHeight * 0.65,
      blockUpper: true,
      inverseNear: true,
      playerCondition: (player) => {
        return (
          player.getBottomY() > state.worldHeight * 0.4 &&
          player.getBottomY() < state.worldHeight * 0.6
        );
      },
      stock: true,
    },
    70: {
      y: state.worldHeight * 0.4,
      mirror: false,
      action: "hide",
      button: true,
    },
    84: {
      y: state.worldHeight * 0.4,
      mirror: false,
      action: "reveal",
      button: true,
    },
    91: {
      window: true,
    },
    98: {
      window: true,
    },
    103: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: 0, movey: 0, movet: 0 },
      slider: true,
      stock: true,
      bottomBump: true,
    },
    104: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: 0, movey: 0, movet: 0 },
      slider: true,
      stock: true,
      bottomBump: true,
    },
    105: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: 0, movey: 0, movet: 0 },
      slider: true,
      stock: true,
      bottomBump: true,
    },
    106: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: 0, movey: 0, movet: 0 },
      slider: true,
      stock: true,
      bottomBump: true,
    },
    107: {
      y: state.worldHeight * 0.75,
      mirror: false,
      dynamic: { movex: 0, movey: 0, movet: 0 },
      slider: true,
      stock: true,
      bottomBump: true,
    },
    105.5: {
      y: state.worldHeight * 0.5,
      mirror: false,
    },
    112: { y: state.worldHeight * 0.1, mirror: false, action: "goup" },
    116: { y: state.worldHeight * 0.8, mirror: true, stock: true },
    118: { y: state.worldHeight * 0.8, mirror: true, stock: true },
    120: { y: state.worldHeight * 0.8, mirror: true, stock: true },
    122: { y: state.worldHeight * 0.8, mirror: true, stock: true },
    126: { y: state.worldHeight * 0.6, mirror: false, fake: true },
    130: {
      y: state.worldHeight * 0.75,
      mirror: true,
      action: "wall",
      stock: true,
    },
    135: {
      y: state.worldHeight * 0.75,
      mirror: true,
      action: "wall",
      stock: true,
    },
    140: {
      block: true,
    },
    148: {
      y: state.worldHeight * 0.7,
      dynamic: { movex: brickW * 11, movey: 0, movet: 11000 },
      slider: true,
      stock: true,
    },
    154: { y: state.worldHeight * 0.4, mirror: false },
    160: { y: state.worldHeight * 0.9, mirror: false, action: "godown" },
    168: {
      y: state.worldHeight * 0.4,
      mirror: false,
      action: "reveal",
      button: true,
    },
    173: { y: state.worldHeight * 0.9, mirror: true, stock: true },
    178: {
      y: state.worldHeight * 0.4,
      mirror: false,
      action: "hide",
      button: true,
    },
    185: { y: state.worldHeight * 0.6, mirror: true }, // very hard (july 4)
    190: { y: state.worldHeight * 0.8, mirror: false }, // very hard (july 4)
    210: { y: state.worldHeight * 0.7, mirror: false, fake: true },
    214: { block: true },
    219: { block: true },
    224: { block: true },
    228: {
      y: state.worldHeight * 0.4,
      dynamic: { movex: brickW * 9, movey: 0, movet: 9000 },
      slider: true,
      stock: true,
    },
    240: { y: state.worldHeight * 0.7, mirror: true },
    241: { y: state.worldHeight * 0.7, mirror: true }, // hard
    248: { window: true },
    253: { window: true },
    255: {
      y: state.worldHeight * 0.7,
      dynamic: { movex: brickW * 14, movey: 0, movet: 14000 },
      slider: true,
      stock: true,
    },
    260: {
      y: state.worldHeight * 0.6,
      mirror: false,
      action: "hide",
      button: true,
    }, // hard
    265: { y: state.worldHeight * 0.2, mirror: false },
    270: { y: state.worldHeight * 0.2, mirror: false },
    275: { y: state.worldHeight * 0.2, mirror: false },
    280: { y: state.worldHeight * 0.5, mirror: true },
    287: { y: state.worldHeight * 0.1, mirror: false, action: "goup" },
    294: { y: state.worldHeight * 0.9, mirror: false, action: "godown" },
    //// final part
    308: { window: true },
    314: {
      y: state.worldHeight * 0.65,
      blockUpper: true,
      inverseNear: true,
      playerCondition: (player) => {
        return (
          player.getBottomY() > state.worldHeight * 0.4 &&
          player.getBottomY() < state.worldHeight * 0.6
        );
      },
      stock: true,
    },
    318: {
      y: state.worldHeight * 0.65,
      blockUpper: true,
      inverseNear: true,
      playerCondition: (player) => {
        return (
          player.getBottomY() > state.worldHeight * 0.4 &&
          player.getBottomY() < state.worldHeight * 0.6
        );
      },
      stock: true,
    },
    322: { y: state.worldHeight * 0.4, mirror: false },
    336: { y: state.worldHeight * 0.6, mirror: true },
    343: {
      y: state.worldHeight * 0.62,
      dynamic: { movex: brickW * 18, movey: 0, movet: 18000 },
      slider: true,
      stock: true,
      lastSlider1: true,
    },
    343.5: {
      y: state.worldHeight * 0.62,
      dynamic: { movex: brickW * 6, movey: 0, movet: 6000 },
      slider: true,
      stock: true,
      visCondition: (gameState, player) => {},
      lastSlider0: true,
    },
    350: {
      block: true,
      inverseNear: true,
      playerCondition: (player) => {
        return (
          player.getBottomY() > state.worldHeight * 0.4 &&
          player.getBottomY() < state.worldHeight * 0.6
        );
      },
      lastBlock: true,
    },
    352: { y: state.worldHeight * 0.9, mirror: true }, // start final
    352.5: { y: state.worldHeight * 0.085, mirror: false },
    353: { y: state.worldHeight * 0.9, mirror: true },
    353.5: { y: state.worldHeight * 0.085, mirror: false },
    354: { y: state.worldHeight * 0.9, mirror: true },
    354.5: { y: state.worldHeight * 0.085, mirror: false },
    //355: { y: state.worldHeight * 0.9, mirror: true },
    //355.5: { y: state.worldHeight * 0.085, mirror: false },
    357: { y: state.worldHeight * 0.9, mirror: true },
    357.5: { y: state.worldHeight * 0.085, mirror: false },
    358: { y: state.worldHeight * 0.9, mirror: true },
    358.5: { y: state.worldHeight * 0.085, mirror: false },
    359: { y: state.worldHeight * 0.9, mirror: true },
    359.5: { y: state.worldHeight * 0.085, mirror: false },
    360: { y: state.worldHeight * 0.9, mirror: true },
    360.5: { y: state.worldHeight * 0.085, mirror: false },
    361: { y: state.worldHeight * 0.9, mirror: true },
    361.5: { y: state.worldHeight * 0.085, mirror: false },

    362: { y: state.worldHeight * 0.4, mirror: false }, // winnner
    362.5: { y: state.worldHeight * 0.65, mirror: true },
    363: { y: state.worldHeight * 0.4, mirror: false },
    363.5: { y: state.worldHeight * 0.65, mirror: true },
    364: { y: state.worldHeight * 0.4, mirror: false },
    364.5: { y: state.worldHeight * 0.65, mirror: true },
  };

  state.symbol = "apa";
  let stock = state.stocks[state.symbol];
  //console.log(state.stocks);
  for (let i = 0; i < 365; i++) {
    if (i in pillars || i + 0.5 in pillars) {
      if (i in pillars) {
        if (pillars[i].slider) {
          createSlider(
            state,
            i * brickW,
            pillars[i].y,
            pillars[i].dynamic.movex,
            pillars[i].dynamic.movet,
            pillars[i].lastSlider0,
            pillars[i].lastSlider1,
            pillars[i].bottomBump
          );
        } else if (pillars[i].button) {
          createButton(state, i * brickW, pillars[i].y, pillars[i].action);
        } else if (pillars[i].block) {
          createBlock(
            state,
            i * brickW,
            pillars[i].inverseNear,
            pillars[i].playerCondition,
            pillars[i].lastBlock
          );
        } else if (pillars[i].blockUpper) {
          createBlockUpper(
            state,
            i * brickW,
            pillars[i].inverseNear,
            pillars[i].playerCondition,
            false,
            pillars[i].y
          );
        } else if (pillars[i].window) {
          createWindow(state, i * brickW);
        } else {
          createPillar(
            state,
            i * brickW,
            pillars[i].y,
            pillars[i].mirror,
            pillars[i].dynamic,
            pillars[i].fake,
            pillars[i].action
          );
        }
      }
      if (i + 0.5 in pillars) {
        if (pillars[i + 0.5].slider) {
          createSlider(
            state,
            i * brickW,
            pillars[i + 0.5].y,
            pillars[i + 0.5].dynamic.movex,
            pillars[i + 0.5].dynamic.movet,
            pillars[i + 0.5].lastSlider0,
            pillars[i + 0.5].lastSlider1
          );
        } else {
          createPillar(
            state,
            i * brickW,
            pillars[i + 0.5].y,
            pillars[i + 0.5].mirror,
            pillars[i + 0.5].dynamic,
            pillars[i + 0.5].fake,
            pillars[i + 0.5].action
          );
        }
      }
      if (
        (i in pillars && !pillars[i].stock) ||
        (i + 0.5 in pillars && !pillars[i + 0.5].stock)
      ) {
        continue;
      }
    }
    let id = 0;
    if (stock[i] < 0) {
      id = state.createStaticBox(
        i * brickW + 5,
        -state.worldHeight / 2,
        brickW - 5,
        state.worldHeight,
        getStockBoxStyle(),
        {
          sideBump: true,
          resistance: 2000,
          resistanceSpeed: 1.5,
          fakeStock: true,
        }
      );
    } else {
      id = state.createStaticBox(
        i * brickW + 5,
        -state.worldHeight * 0.7,
        brickW - 5,
        state.worldHeight,
        getStockBoxStyle(),
        { sideBump: true, stock: true }
      );
    }
    state.dateToIds[i] = id;
    // NOTE: Its important that diff box is created next
    state.createBgBox(
      i * brickW + 5, //i * brickW + 5 + (brickW / 2 - brickW / 8 / 2),
      0,
      brickW - 5, //brickW / 8 - 5,
      state.worldHeight * 0.05,
      {
        backgroundColor: "#44d5442f",
        outline: "2px solid #0000007d",
        borderRadius: 3,
      },
      { stockDiff: true }
    );
  }

  // left wall
  state.createStaticBox(
    -200,
    -200,
    200,
    state.worldHeight + 200,
    {},
    {
      sideBump: true,
      wall: true,
    }
  );
  // right wall
  state.createBgBox(
    state.worldWidth,
    -200,
    200,
    state.worldHeight + 200,
    {},
    { sideBump: true, wall: true }
  );

  // Don't look up
  state.createBgBox(
    state.worldWidth - 1650,
    state.worldHeight * 0.425,
    900,
    state.worldHeight * 0.2,
    {},
    {
      text: {
        text: "Your hard work opens the gate for new opportunities!",
        fontSize: 75,
        fontFamily: "Slackey-Regular",
        color: "#ffcf8780",
      },
    }
  );

  // floor
  state.createBgBox(
    -200,
    0,
    state.worldWidth + 400,
    10,
    {
      backgroundColor: "red",
      /*...invisibleBoxStyle, backgroundColor: "#69401d"*/
    },
    {
      wall: true,
    }
  );

  // ceiling
  state.createStaticBox(
    -200,
    state.worldHeight,
    state.worldWidth + 400,
    200,
    {
      /* ...invisibleBoxStyle, backgroundColor: "#f2ecab" */
    },
    { wall: true }
  );
}

export default LoadMap1;
