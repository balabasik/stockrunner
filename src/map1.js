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

function createPillar(state, x, y, mirror) {
  let transform = mirror ? "scaleY(-1)" : "";
  state.createStaticBox(
    x + 5,
    mirror ? y : y - 1200,
    brickW - 5,
    1200,
    { ...getBoxBgStyle("pipe.png"), transform: transform },
    { sideBump: true, bottomBump: mirror }
  );
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

  /*
  state.stocks["am1"] = state.stocks["goog"];
  state.stocks["am2"] = state.stocks["goog"];
  state.stocks["am3"] = state.stocks["goog"];
  state.stocks["am4"] = state.stocks["goog"];
  state.stocks["am5"] = state.stocks["goog"];
  state.stocks["am6"] = state.stocks["goog"];

  state.stocks["cr1"] = state.stocks["goog"];
  state.stocks["cr2"] = state.stocks["goog"];
  state.stocks["cr3"] = state.stocks["goog"];
  state.stocks["cr4"] = state.stocks["goog"];
  state.stocks["cr5"] = state.stocks["goog"];
  state.stocks["cr6"] = state.stocks["goog"];
  state.stocks["cr7"] = state.stocks["goog"];
  state.stocks["cr8"] = state.stocks["goog"];
  state.stocks["cr9"] = state.stocks["goog"];
  state.stocks["cr10"] = state.stocks["goog"];
  state.stocks["cr11"] = state.stocks["goog"];
*/

  state.stockMap = {};
  for (let key in state.stocks) {
    if (key.length > 1) {
      let sub = key.substring(0, 2);
      if (!state.stockMap[sub]) {
        state.stockMap[sub] = [];
      }
      state.stockMap[sub].push(key);
    } else {
      state.stockMap[key] = [key];
    }
  }

  let pillars = {
    0: { y: state.worldHeight * 0.5, mirror: false },
    16: { y: state.worldHeight / 2, mirror: false },
    28: { y: state.worldHeight * 0.7, mirror: false },
    42: { y: state.worldHeight * 0.5, mirror: true }, // hard
    56: { y: state.worldHeight * 0.3, mirror: false },
    70: { y: state.worldHeight * 0.7, mirror: false }, // semi hard
    84: { y: state.worldHeight * 0.4, mirror: true },
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
        createPillar(state, i * brickW, pillars[i].y, pillars[i].mirror);
      }
      if (i + 0.5 in pillars) {
        createPillar(
          state,
          i * brickW,
          pillars[i + 0.5].y,
          pillars[i + 0.5].mirror
        );
      }
      continue;
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
