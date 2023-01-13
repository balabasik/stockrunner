import GameState, { leftGearLetters, rightGearLetters } from "./gameState";
import { GetTime, GetRand } from "./utils";
import Player from "./player";
import Keys from "./keys";

class Physics {
  constructor(initState, requestKeys, onNewState, onReady) {
    this.initState = initState;
    this.onNewState = onNewState;
    this.onReady = onReady;
    this.loadMap();
    this.requestKeys = requestKeys;
    this.stopped = false;
    this.timeStampIsSet = false;
    this.rightClickEvents = 0;
    this.clicks = 0;

    this.updateCounter = 0;
    this.lastUpdateTime = 0;

    this.addPlayerToState(this.initState.playerInfo);
    this.onReady();
    this.updateState();
  }

  stop() {
    this.stopped = true;
  }

  addPlayerToState(playerInfo) {
    this.state.player = new Player(0, playerInfo);
    this.state.playerKeys = new Keys();
  }

  reinitTime() {
    this.initTime = GetTime();
    this.realInitTime = this.initTime;
    this.state.gameTime = 0;
  }

  loadMap() {
    this.state = new GameState(this);
    this.reinitTime();
  }

  getState() {
    return this.state;
  }

  updateState() {
    if (this.stopped) return;
    this.updateCounter++;
    this.state.playerKeys = this.requestKeys();

    this.computeNewState();
    this.onNewState(this.state);
    let newUpdateTime = GetTime();
    if (this.lastUpdateTime == 0) this.lastUpdateTime = newUpdateTime;
    let baseDelay = 25;
    let delay = Math.max(0, baseDelay - (newUpdateTime - this.lastUpdateTime));
    /*let delay = Math.min(
      baseDelay,
      Math.max(0, 2 * baseDelay - (newUpdateTime - this.lastUpdateTime))
    );*/
    //console.log(delay);
    //sconsole.log(newUpdateTime - this.lastUpdateTime);
    this.lastUpdateTime = newUpdateTime;
    setTimeout(this.updateState.bind(this), delay);
  }

  gameFinished(winner) {
    this.state.physicsStats.gameStatus = {
      paused: true,
      winner: winner,
    };
  }

  pause(paused) {
    this.state.physicsStats.gameStatus.paused = paused;
  }

  resetStocks() {
    this.state.symbol = "apa";
    this.setStocks();
    /*for (let key in this.state.boxes) {
      let box = this.state.boxes[key];
      if (!box.stats.stock) continue;
      box.setBottomY(-this.state.worldHeight / 2);
    }*/
  }

  restartGame() {
    this.state.player.stats.isDead = true;
    this.reinitTime();
    this.state.resetFirePosX();
    this.revivePlayer(this.state.player, this.newTimeStamp);
    this.resetStocks();
    this.state.resetPhysicsStats();
    this.state.physicsStats.gameStatus.paused = false;
  }

  computeNewState() {
    let now = GetTime();
    let newTimeStamp = now - this.initTime;
    this.myGameTime = now - this.realInitTime;
    let elapsedTime = newTimeStamp - this.state.timeStamp;

    //console.log(this.state.physicsStats.gameStatus.paused);

    if (
      !this.state.physicsStats.gameStatus.paused &&
      !this.state.physicsStats.gameStatus.winner
    ) {
      let player = this.state.player;
      let key = this.state.playerKeys;
      //console.log(elapsedTime);
      let before = GetTime();
      if (!player.stats.isDead) {
        this.movePlayer(elapsedTime, player, key);
        this.applyPressure(elapsedTime, player);
        this.moveBoxes(player, newTimeStamp);
        // NOTE: This second applyPressure is to release the box that was pressed under the player in case if he was stopped by another box.
        this.applyPressure(elapsedTime, player);
        this.updateStocks(key);
        this.tryFire(this.state.player, newTimeStamp, this.state.playerKeys);
        if (player.getBottomY() < 5) {
          this.die("You dropped on lava. Game over.");
        }
        if (player.getRightX() >= this.state.worldWidth) {
          this.state.physicsStats.gameStatus.winner = true;
        }
        if (elapsedTime > 0) this.state.gameTime += elapsedTime;
        this.moveFire(player, elapsedTime);
      }
      /*console.log(
        "Compute state took:",
        GetTime() - before,
        "Elapsed time:",
        elapsedTime
      );*/
    }
    this.state.timeStamp = newTimeStamp;
  }

  updateStocks(key) {
    if (!this.state || !this.state.ready) return;

    let oldLength = this.state.stockFilter.length;
    let oldFirst = oldLength > 0 ? this.state.stockFilter[0] : "";
    this.setLeftGear();
    this.setRightGear();
    if (!this.state.rightGear.activeId) return;
    let stockFilter = [];
    for (let letter of rightGearLetters[this.state.rightGear.activeId - 1]) {
      stockFilter.push(
        leftGearLetters[this.state.leftGear.activeId + 1].toLowerCase() +
          (letter == " " ? "" : letter.toLowerCase())
      );
    }
    this.state.stockFilter = [];
    for (let key of stockFilter) {
      if (!this.state.stockMap[key]) continue;
      for (let item of this.state.stockMap[key]) {
        this.state.stockFilter.push(item);
      }
    }

    /*if (key.rightClickEvents > this.rightClickEvents) {
      this.state.shiftStockId = this.state.shiftStockId + 1;
      //console.log("right click!", this.state.shiftStockId);
      this.rightClickEvents = key.rightClickEvents;
    }*/

    if (
      oldLength != this.state.stockFilter.length ||
      (oldLength > 0 && oldFirst != this.state.stockFilter[0])
    )
      this.state.shiftStockId = 0;
  }

  pressBox(box, player, elapsedTime) {
    if (elapsedTime <= 0) return;
    let touching = this.isPlayerTouchingBoxTop(player, box);
    if (touching && (box.stats.stock || box.stats.fakeStock)) {
      box.stats.overrideBg = box.stats.stock ? "#a1c1f3" : "#f68d8d";
    } else {
      box.stats.overrideBg = false;
    }
    if (touching && box.stats.displacement < box.stats.resistance) {
      let newDisp = Math.min(
        box.stats.resistance,
        box.stats.displacement + elapsedTime * box.stats.resistanceSpeed
      );
      let shift = newDisp - box.stats.displacement;
      box.stats.displacement = newDisp;
      box.setBottomY(box.getBottomY() - shift);
      player.stats.intendedMoveY = -shift;
      this.tryMovePlayer(player);
      player.stats.speedY = 0;
      //console.log(player.getBottomY(), box.getTopY());
    } else if (!touching && box.stats.displacement > 0) {
      // bring the box back
      let newDisp = Math.max(
        0,
        box.stats.displacement - elapsedTime * box.stats.resistanceSpeed
      );
      if (
        player.getLeftX() < box.getRightX() &&
        player.getRightX() > box.getLeftX() &&
        player.getBottomY() > box.getTopY()
      ) {
        newDisp = Math.max(
          box.getTopY() + box.stats.displacement - player.getBottomY(),
          newDisp
        );
      }
      let shift = newDisp - box.stats.displacement;
      box.stats.displacement = newDisp;
      box.setBottomY(box.getBottomY() - shift);
    }
  }

  applyPressure(elapsedTime, player) {
    for (var key in this.state.boxes) {
      let box = this.state.boxes[key];
      if (!box.stats.interactable) continue;
      this.pressBox(box, player, elapsedTime);
    }
  }

  setLeftGear() {
    if (!this.state) return;
    let day = (365 * this.state.player.getLeftX()) / this.state.worldWidth;
    let angle = (day * 15) % (360 * 26);
    let activeId = Math.floor((day + 1) / 3) % 26;
    this.state.leftGear = { angle, activeId };
  }

  setRightGear() {
    if (!this.state) return;
    // NOTE: We only perform setRightGear if player is touching some box.
    if (!this.state.player.stats.isTouchingBox) return;

    let angle = Math.floor(
      (this.state.player.getBottomY() / this.state.worldHeight) * 180
    );
    let activeId = Math.floor(
      (1 - this.state.player.getBottomY() / this.state.worldHeight) * 8
    );
    this.state.rightGear = { angle, activeId };
  }

  moveFire(player, elapsedTime) {
    // If player is 10% away from fire then fire moves 2x faster.
    let mult =
      0.8 *
      Math.max(
        1,
        ((this.state.player.getLeftX() - this.state.firePosX) /
          this.state.worldWidth) *
          50
      );
    this.state.firePosX +=
      mult * elapsedTime * (this.state.worldWidth / 300000);
    if (this.state.firePosX > this.state.player.getLeftX() + 50) {
      this.die("2022 got to you! Start the year over.");
    }
  }

  die(message) {
    this.state.message = message;
    this.state.player.stats.isDead = true;
    this.pause(true);
  }

  setStocks() {
    if (!this.state || !this.state.ready) return;
    let bottom = -0.7;
    //console.log(this.state.stocks[this.state.symbol]);
    for (let date in this.state.dateToIds) {
      let box = this.state.boxes[this.state.dateToIds[date]];
      if (box.getLeftX() < this.state.player.getRightX()) continue;
      if (this.state.stocks[this.state.symbol][date] > -0.5) {
        /*box.stats.style = {
          backgroundColor: "#b7e0ff",
          outline: "5px solid #4e4e4e",
        };*/
        /*box.setH(
          Math.floor(
            this.state.worldHeight *
              0.8 *
              this.state.stocks[this.state.symbol][date]
          )
        );*/
        bottom = Math.min(
          -0.1,
          Math.max(
            -0.9,
            this.state.stocks[this.state.symbol][date] -
              1 +
              0.01 * (((date - 3) % 7) * 2 - 1)
          )
        );
        box.setBottomY(Math.floor(this.state.worldHeight * bottom));
      } else {
        box.stats.displacement = 0;
        bottom = Math.min(
          -0.1,
          Math.max(-0.9, bottom + 0.1 * ((date % 2) * 2 - 1))
        );
        box.setBottomY(Math.floor(this.state.worldHeight * bottom));
      }
    }
  }

  tryFire(player, newTimeStamp, keys) {
    //if (!keys.leftClick) return;
    if (this.state.clicks <= this.clicks) {
      return;
    }
    this.clicks = this.state.clicks;

    let realId =
      Math.floor(this.state.stockFilter.length / 2 + this.state.shiftStockId) %
      this.state.stockFilter.length;
    while (realId < 0) {
      realId += this.state.stockFilter.length;
    }
    if (!this.state.stockFilter[realId]) return;

    if (this.state.lastBoxUpdate && GetTime() - this.state.lastBoxUpdate < 150)
      return;

    if (this.state.player.stats.stockChanges >= 99) {
      return;
    }
    this.state.player.stats.stockChanges++;

    this.state.lastBoxUpdate = GetTime();

    this.state.symbol = this.state.stockFilter[realId];
    //if (this.state.symbol == "goog") this.state.symbol = "ko";
    //else this.state.symbol = "goog";

    // This is so that stocks transition pretty.
    // NOTE: There might be races in how often this is called, but its not that important.
    this.state.transitionDelay = true;
    setTimeout(() => {
      this.state.transitionDelay = false;
    }, 100);

    this.setStocks();
  }

  revivePlayer(player, timeStamp) {
    if (!player.stats.isDead) return; // player has already been revived
    /*if (timeStamp - player.stats.deathTime < 1000) {
      // Wait for 1 second before letting player to revive
      setTimeout(this.revivePlayer.bind(this, player, timeStamp + 1000), 1000);
      return;
    }*/

    player.initStats();
    player.stats.reviveTime = timeStamp;
    let id = GetRand(this.state.playerBirthPlaces.length);
    let birthPlace = this.state.playerBirthPlaces[id];

    player.setLeftX(birthPlace[0]);
    player.setBottomY(birthPlace[1]);

    this.state.playerKeys[player.id] = {
      keys: new Keys({
        clientX: birthPlace[0],
        clientY: birthPlace[1],
      }),
      timeStamp: this.state.timeStamp,
    };

    player.stats.forceClientGeometry = {
      active: true,
      time: this.state.timeStamp,
    };

    player.stats.isDead = false;
  }

  moveBoxes(player, newTimeStamp) {
    for (var key in this.state.boxes) {
      let box = this.state.boxes[key];
      if (
        box.stats.linear == undefined ||
        (box.stats.linear.movey == 0 && box.stats.linear.movex == 0) ||
        box.stats.linear.movet == 0
      )
        continue;
      if (!box.stats.interactable) continue;

      this.skipBoxCheck = key;
      // First check for touching
      if (this.isPlayerTouchingBoxTop(player, box)) {
        player.stats.intendedMoveY =
          box.getTopY(newTimeStamp) - box.getTopY(this.state.timeStamp);
        player.stats.intendedMoveX =
          box.getLeftX(newTimeStamp) - box.getLeftX(this.state.timeStamp);
        this.tryMovePlayer(player);
      } else {
        // Now check if player was on the way of box move
        let newBoxLeftX = box.getLeftX(newTimeStamp);
        let curBoxLeftX = box.getLeftX(this.state.timeStamp);
        let newBoxRightX = box.getRightX(newTimeStamp);
        let curBoxRightX = box.getRightX(this.state.timeStamp);
        let curBoxTopY = box.getTopY(this.state.timeStamp);
        let newBoxTopY = box.getTopY(newTimeStamp);
        let curBoxBottomY = box.getBottomY(this.state.timeStamp);
        let newBoxBottomY = box.getBottomY(newTimeStamp);
        if (
          !(
            player.getLeftX() >= curBoxRightX ||
            player.getRightX() <= curBoxLeftX
          ) &&
          curBoxTopY <= player.getBottomY() &&
          newBoxTopY >= player.getBottomY()
        ) {
          player.stats.intendedMoveY = newBoxTopY - player.getBottomY();
          this.tryMovePlayer(player);
        } else if (
          !(
            player.getTopY() <= curBoxBottomY ||
            player.getBottomY() >= curBoxTopY
          )
        ) {
          // box hits the player on the left
          if (
            curBoxRightX <= player.getLeftX() &&
            newBoxRightX >= player.getLeftX()
          ) {
            player.stats.intendedMoveX = newBoxRightX - player.getLeftX();
            this.tryMovePlayer(player);
          }
          // box hits the player on the right
          else if (
            curBoxLeftX >= player.getRightX() &&
            newBoxLeftX <= player.getRightX()
          ) {
            player.stats.intendedMoveX = newBoxLeftX - player.getRightX();
            this.tryMovePlayer(player);
          }
        }
      }
      this.skipBoxCheck = undefined;
    }
  }

  handlePlayerInputY(elapsedTime, player, keys) {
    if (
      keys != undefined &&
      keys.upKey &&
      (player.stats.canFly ||
        (this.isPlayerTouchingFloor(player).touch && player.stats.speedY == 0))
    ) {
      // Player is jumping
      player.stats.speedY =
        this.state.physicsStats.gravityG > 0
          ? player.stats.origSpeedY
          : -player.stats.origSpeedY;
    }
    player.stats.speedY -= this.state.physicsStats.gravityG * elapsedTime;
    player.stats.intendedMoveY = player.stats.speedY * elapsedTime;
  }

  handlePlayerInputX(elapsedTime, player, keys) {
    if (keys != undefined) {
      if (keys.leftKey && !keys.rightKey)
        player.stats.speedX = -player.stats.origSpeedX;
      else if (keys.rightKey && !keys.leftKey)
        player.stats.speedX = player.stats.origSpeedX;
      else player.stats.speedX = 0;
    }

    player.stats.intendedMoveX =
      (player.stats.speedX + player.stats.extraSpeedX) * elapsedTime;

    // If player is flying we return.
    if (player.stats.canFly) {
      player.clientStats.isWalking = false;
      return;
    }

    // Air friction
    // NOTE: We do not slow down player in the air.
    // Only slow player down if he is touching floor.
    let touch = this.isPlayerTouchingFloor(player);

    player.clientStats.isWalking =
      touch.touch &&
      keys.leftKey ^ keys.rightKey &&
      Math.abs(player.stats.speedX) > 0.3;

    if (
      player.stats.extraSpeedX != 0 &&
      touch.touch &&
      !player.stats.onSpring // original spring might slow down
    ) {
      let positive = player.stats.extraSpeedX > 0;
      player.stats.extraSpeedX -=
        (positive ? 1 : -1) * player.stats.extraSpeedXDecay * elapsedTime;
      if (positive == player.stats.extraSpeedX < 0)
        player.stats.extraSpeedX = 0;
    } else if (player.stats.onSpring) player.stats.onSpring = false;
  }

  isPlayerTouchingBoxTop(player, box, overrideTime) {
    if (player.stats.canFly) return false;
    let time = overrideTime == undefined ? this.state.timeStamp : overrideTime;
    if (this.state.physicsStats.gravityG > 0) {
      let touching =
        !(
          player.getLeftX() >= box.getRightX(time) ||
          player.getRightX() <= box.getLeftX(time)
        ) && box.getTopY(time) == player.getBottomY();
      if (touching) player.stats.isTouchingBox = true;
      return touching;
    } else {
      //  NOTE: When gravity is negative we skip everything except floors
      if (!box.stats.reverseGravityBump) return false;
      return (
        !(
          player.getLeftX() >= box.getRightX(time) ||
          player.getRightX() <= box.getLeftX(time)
        ) && box.getBottomY(time) == player.getTopY()
      );
    }
  }

  isPlayerTouchingFloor(player, overrideTime) {
    if (player.stats.canFly) return { touch: false };
    if (
      (this.state.physicsStats.gravityG > 0 &&
        player.getBottomY() == this.state.floorY) ||
      (this.state.physicsStats.gravityG <= 0 &&
        player.getTopY() == this.state.floorY + this.state.worldHeight)
    ) {
      return { touch: true, type: "floor" };
    }

    for (let key in this.state.boxes) {
      let box = this.state.boxes[key];
      if (this.isPlayerTouchingBoxTop(player, box, overrideTime)) {
        return { touch: true, type: "box", id: box.stats.id };
      }
    }
    return { touch: false };
  }

  playerCollideBoxY(player, box) {
    if (player.stats.canFly) return false;
    // NOTE: Only between floors walls are interacting when gravity is reversed
    if (this.state.physicsStats.gravityG <= 0 && !box.stats.reverseGravityBump)
      return false;

    var curY = player.getBottomY();
    var intY = curY + player.stats.intendedMoveY;
    var leftX = player.getLeftX();
    var rightX = player.getRightX();
    return (
      !(
        leftX >= box.getRightX(this.state.timeStamp) ||
        rightX <= box.getLeftX(this.state.timeStamp)
      ) &&
      ((this.state.physicsStats.gravityG > 0 &&
        curY >= box.getTopY(this.state.timeStamp) &&
        intY <= box.getTopY(this.state.timeStamp)) ||
        ((this.state.physicsStats.gravityG <= 0 || box.stats.bottomBump) &&
          curY + player.getH() <= box.getBottomY(this.state.timeStamp) &&
          intY + player.getH() >= box.getBottomY(this.state.timeStamp)))
    );
  }

  playerCollideWorldY(player) {
    //console.log("collideY");
    var curY = player.getBottomY();
    var intY = curY + player.stats.intendedMoveY;
    var leftX = player.getLeftX();
    var rightX = player.getRightX();

    // Checking boxes first
    var ret = false;
    // FIXME: This is a hack, shouldn't really do it this way,
    // cause some boxes might be touched from the top.
    var maxY =
      this.state.physicsStats.gravityG > 0 && player.stats.intendedMoveY < 0
        ? 0
        : this.state.worldHeight;

    // Spell 4D
    if (!player.stats.canFly) {
      for (let key in this.state.boxes) {
        let box = this.state.boxes[key];
        // FIXME: This is a hack, shouldn't really do it this way,
        // cause some boxes might be touched from the top.
        if (key == this.skipBoxCheck) continue;
        if (!box.stats.interactable) continue;
        if (this.playerCollideBoxY(player, box)) {
          // FIXME: This is a hack, shouldn't really do it this way,
          // cause some boxes might be touched from the top.
          if (
            this.state.physicsStats.gravityG > 0 &&
            player.stats.intendedMoveY < 0
          ) {
            maxY = Math.max(maxY, box.getTopY(this.state.timeStamp));
          } else {
            maxY = Math.min(
              maxY,
              box.getBottomY(this.state.timeStamp) - player.getH()
            );
          }
          ret = true;
        }
      }
    }

    if (ret) {
      player.setBottomY(maxY);
      return true;
    }

    // Checking top of the world
    if (intY + player.getH() >= this.state.worldHeight) {
      player.setBottomY(this.state.worldHeight - player.getH());
      return true;
    }

    // Checking bottom of the world last
    if (intY <= 0) {
      player.setBottomY(0);
      return true;
    }

    player.setBottomY(intY);
    return false;
  }

  playerCollideWorldX(player) {
    //console.log("collideX");
    var curX = player.getLeftX();
    var intX = curX + player.stats.intendedMoveX;
    var bottomY = player.getBottomY();
    var topY = player.getTopY();

    // Moving to the right
    if (player.stats.intendedMoveX > 0) {
      // Box collision
      var minX = this.state.worldWidth;
      var ret = false;
      if (!player.stats.canFly)
        for (let key in this.state.boxes) {
          let box = this.state.boxes[key];
          if (key == this.skipBoxCheck) continue;
          if (!box.stats.interactable) continue;
          // NOTE: Most of the boxes are not side-bumpable
          if (!box.stats.sideBump) continue;
          if (
            !(
              bottomY >= box.getTopY(this.state.timeStamp) ||
              topY <= box.getBottomY(this.state.timeStamp)
            ) &&
            curX + player.getW() <= box.getLeftX(this.state.timeStamp) &&
            intX + player.getW() >= box.getLeftX(this.state.timeStamp)
          ) {
            minX = Math.min(minX, box.getLeftX(this.state.timeStamp));
            ret = true;
          }
        }
      if (ret) {
        player.setLeftX(minX - player.getW());
        return true;
      }
      // Checking world last
      if (intX + player.getW() >= this.state.worldWidth) {
        player.setLeftX(this.state.worldWidth - player.getW());
        return true;
      }
    } else {
      // Moving to the left
      // Box collision
      var maxX = 0;
      var ret = false;
      if (!player.stats.canFly)
        for (let key in this.state.boxes) {
          let box = this.state.boxes[key];
          if (key == this.skipBoxCheck) continue;
          if (!box.stats.interactable) continue;
          if (!box.stats.sideBump) continue;
          if (
            !(
              bottomY >= box.getTopY(this.state.timeStamp) ||
              topY <= box.getBottomY(this.state.timeStamp)
            ) &&
            curX >= box.getRightX(this.state.timeStamp) &&
            intX <= box.getRightX(this.state.timeStamp)
          ) {
            maxX = Math.max(maxX, box.getRightX(this.state.timeStamp));
            ret = true;
          }
        }
      if (ret) {
        player.setLeftX(maxX);
        return true;
      }
      // Check world
      if (intX <= 0) {
        player.setLeftX(0);
        return true;
      }
    }
    player.setLeftX(intX);
    return false;
  }

  tryMovePlayer(player, temporal) {
    if (player.stats.intendedMoveX != 0)
      if (this.playerCollideWorldX(player)) {
        player.stats.speedX = 0;
        player.stats.extraSpeedX = 0;
      }

    if (player.stats.intendedMoveY != 0)
      if (this.playerCollideWorldY(player)) {
        player.stats.speedY = 0;
      }

    player.stats.intendedMoveX = 0;
    player.stats.intendedMoveY = 0;
  }

  tryTeleport(player, keys, temporal) {
    if (!player.stats.teleportTo.active) {
      if (
        keys == undefined ||
        !keys.downKey ||
        this.state.timeStamp - player.stats.lastSitTime <
          player.stats.sitReloadTime
      )
        return;

      //console.log(player.stats.lastSitTime + " " + player.stats.sitReloadTime);
      for (let key in this.state.boxes) {
        let box = this.state.boxes[key];
        if (!box.stats.interactable) continue;
        if (box.stats.type != "teleport") continue;
        if (this.isPlayerTouchingBoxTop(player, box)) {
          // Player has touched teleport
          let dest = this.state.boxes[box.stats.extra["dest"]];
          let x = dest.getLeftX(this.state.timeStamp) + box.getW() / 2; // middle
          let y = dest.getTopY(this.state.timeStamp);
          player.stats.teleportTo = { active: true, x: x, y: y };
          player.stats.lastSitTime = this.state.timeStamp;
          //console.log(box.id + " " + this.state.timeStamp);
          break;
        }
      }
    }
    if (!player.stats.teleportTo.active) return;
    player.setBottomY(player.stats.teleportTo.y);
    player.setLeftX(player.stats.teleportTo.x);
    player.stats.teleportTo = { active: false, x: 0, y: 0 };
  }

  trySpring(player, temporal) {
    player.stats.onSpring = false;
    for (let key in this.state.boxes) {
      let box = this.state.boxes[key];
      if (!box.stats.interactable) continue;
      if (box.stats.type != "spring") continue;
      if (this.isPlayerTouchingBoxTop(player, box)) {
        //console.log("spring " + box.id);
        player.stats.extraSpeedX = box.stats.extra.speedX;
        player.stats.speedY = box.stats.extra.speedY;
        player.stats.onSpring = true;
        //console.log(box.stats.extra.speedX, box.stats.extra.speedY);
        break;
      }
    }
  }

  movePlayer(elapsedTime, player, keys) {
    //console.log(player.id, keys, temporal);
    if (keys == undefined) return; // Might happen at the very beginning
    player.stats.isTouchingBox = false;
    this.handlePlayerInputY(elapsedTime, player, keys);
    this.handlePlayerInputX(elapsedTime, player, keys);
    this.tryMovePlayer(player);
    if (!player.stats.canFly) {
      this.tryTeleport(player, keys);
      this.trySpring(player);
    }
    player.sprite.update(elapsedTime, keys);
  }
}

export default Physics;
