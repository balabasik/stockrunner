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
        let near = distance > -250 && distance < 250;
        if (action == "goup") {
          if (near && box.getBottomY() < state.worldHeight * 1 - 1400) {
            box.setBottomY(box.getBottomY() + elapsedTime * 3);
          } else if (!near && box.getBottomY() > y - 1400) {
            box.setBottomY(box.getBottomY() - elapsedTime * 3);
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

function createSlider(state, x, y, movex, movet) {
  state.createDynamicBox(
    x + 5,
    y,
    brickW - 5,
    90,
    movex,
    0,
    movet,
    { ...getBoxBgStyle("slider.png") },
    { sideBump: false }
  );
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

function createBlock(state, x) {
  createBlockLower(state, x);
  createBlockUpper(state, x);
}

function createBlockLower(state, x) {
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
  box.stats.action = (elapsedTime, touching, distance) => {
    let near = distance > -100 && distance < 100;
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
    0.35 * state.worldHeight - 1200,
    brickW - 5,
    1200,
    0,
    300,
    1000,
    { ...getBoxBgStyle("window.png") },
    { sideBump: true }
  );
  state.createDynamicBox(
    x + 5,
    0.55 * state.worldHeight,
    brickW - 5,
    1200,
    0,
    300,
    1000,
    { ...getBoxBgStyle("window.png"), transform: "scaleY(-1)" },
    { sideBump: true }
  );
}

function createBlockUpper(state, x) {
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
  let box = state.boxes[id];
  box.stats.action = (elapsedTime, touching, distance) => {
    let near = distance > -100 && distance < 100;
    if (near && box.getBottomY() > state.worldHeight * 0.5) {
      box.setBottomY(
        Math.max(state.worldHeight * 0.5, box.getBottomY() - elapsedTime * 3)
      );
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
    [5, 0.7],
    [10, 0.85],
    [10.6, 0.85],
    [11.2, 0.85],
    [11.8, 0.85],
    [12.4, 0.85],
  ];
  state.perkCreationPlaces = perkPlaces.map((pair) => {
    return [
      pair[0] * brickW - brickW / 2 - 120 / 2, // perkW = 120
      pair[1] * state.worldHeight,
    ];
  });

  // 160 is player width
  state.playerBirthPlaces = [[brickW / 2 - 160 / 2, state.worldHeight * 0.8]];
  //state.playerBirthPlaces = [[80000, state.worldHeight * 0.8]];
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
    5: {
      window: true,
    },
    9: {
      y: state.worldHeight * 0.6,
      mirror: false,
      dynamic: { movex: 600, movey: 0, movet: 1800 },
      slider: true,
      stock: true,
    },
    7: {
      y: state.worldHeight * 0.3,
      block: true,
    },
    8: {
      y: state.worldHeight * 0.3,
      mirror: false,
      action: "hide",
      button: true,
    },
    12: {
      y: state.worldHeight * 0.3,
      mirror: false,
      action: "reveal",
      button: true,
    },
    16: { y: state.worldHeight * 0.5, mirror: false, fake: true },
    3: { y: state.worldHeight * 0.1, mirror: false, action: "goup" },
    42: { y: state.worldHeight * 0.6, mirror: true, stock: true }, // hard
    56: { y: state.worldHeight * 0.3, mirror: false },
    70: { y: state.worldHeight * 0.7, mirror: false }, // semi hard
    84: { y: state.worldHeight * 0.6, mirror: true },
    98: { y: state.worldHeight * 0.6, mirror: true },
    99: { y: state.worldHeight * 0.4, mirror: false }, // hard
    112: { y: state.worldHeight * 0.4, mirror: false },
    126: { y: state.worldHeight * 0.7, mirror: false },
    140: { y: state.worldHeight * 0.5, mirror: true }, // hard
    154: { y: state.worldHeight * 0.4, mirror: false },
    168: { y: state.worldHeight * 0.8, mirror: true },
    168.5: { y: state.worldHeight * 0.4, mirror: false },
    185: { y: state.worldHeight * 0.4, mirror: true },
    190: { y: state.worldHeight * 0.8, mirror: false }, // very hard (july 4)
    210: { y: state.worldHeight * 0.4, mirror: false },
    224: { y: state.worldHeight * 0.7, mirror: false },
    238: { y: state.worldHeight * 0.7, mirror: true },
    239: { y: state.worldHeight * 0.7, mirror: true }, // medium hard
    240: { y: state.worldHeight * 0.7, mirror: true },
    241: { y: state.worldHeight * 0.7, mirror: true }, // hard
    252: { y: state.worldHeight * 0.3, mirror: false },
    266: { y: state.worldHeight * 0.9, mirror: true },
    280: { y: state.worldHeight * 0.5, mirror: false },
    281: { y: state.worldHeight * 0.7, mirror: true }, // hard
    294: { y: state.worldHeight * 0.3, mirror: false },
    308: { y: state.worldHeight * 0.8, mirror: true }, // medium hard
    322: { y: state.worldHeight * 0.4, mirror: false },
    336: { y: state.worldHeight * 0.7, mirror: false },
    352: { y: state.worldHeight * 0.9, mirror: true }, // start final
    352.5: { y: state.worldHeight * 0.085, mirror: false },
    353: { y: state.worldHeight * 0.9, mirror: true },
    353.5: { y: state.worldHeight * 0.085, mirror: false },
    354: { y: state.worldHeight * 0.9, mirror: true },
    354.5: { y: state.worldHeight * 0.085, mirror: false },
    355: { y: state.worldHeight * 0.9, mirror: true },
    355.5: { y: state.worldHeight * 0.085, mirror: false },
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
            pillars[i].dynamic.movet
          );
        } else if (pillars[i].button) {
          createButton(state, i * brickW, pillars[i].y, pillars[i].action);
        } else if (pillars[i].block) {
          createBlock(state, i * brickW);
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
      if (
        (i in pillars && pillars[i].stock) ||
        (i + 0.5 in pillars && pillars[i + 0.5].stock)
      ) {
        //
      } else {
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
        -state.worldHeight / 2,
        brickW - 5,
        state.worldHeight,
        getStockBoxStyle(),
        { sideBump: true, stock: true }
      );
    }
    state.dateToIds[i] = id;
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
