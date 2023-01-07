export default class Sprite {
  constructor(player) {
    //this.stand_sprite = props.stand_sprite;
    //this.run_sprite = props.run_sprite;
    //this.jump_sprite = props.jump_sprite;

    this.fullH = 240;
    this.fullW = 480;
    this.len = 8;
    this.player = player;
    this.avatar = "scott";
    this.srcs = { scott: "scott_sprite.png", ramona: "ramona_sprite.png" };

    this.sprites = {
      run: {
        id: 1,
        loop: true,
      },
      stand: {
        id: 0,
        loop: true,
      },
      jump: {
        id: 2,
        loop: false,
      },
    };
  }

  reset() {
    this.leftShift = 0;
    this.topShift = 0;
    this.left = 0;
    this.active = "stand";
    this.faceRight = true;
    // real H so image will be scaled to this
    this.playerH = 240;
    this.updateStep();
  }

  updateStep() {
    let spriteH = this.fullH / 3;
    let spriteW = this.fullW / this.len;
    let scale = this.playerH / spriteH;
    this.stepW = scale * spriteW;
    this.stepH = scale * spriteH;
  }

  update(elapsedTime, keys) {
    if (elapsedTime < 0) elapsedTime = 0;

    let action =
      this.player.stats.speedX != 0 && this.player.stats.speedY == 0
        ? "run"
        : this.player.stats.speedY != 0
        ? "jump"
        : "stand";

    let faceRight =
      this.player.stats.speedX != 0 ? this.player.stats.speedX > 0 : undefined;

    if (action == "stand" && keys != undefined && keys.leftKey) {
      action = "run";
      faceRight = false;
    } else if (action == "stand" && keys != undefined && keys.rightKey) {
      action = "run";
      faceRight = true;
    }

    if (action != this.active) {
      this.left = 0;
      this.active = action;
    }

    if (faceRight != undefined) {
      this.faceRight = faceRight;
    }

    this.updateStep();
    // need to know times??
    // jump_start, jump_midpoint, jump_land
    // run_start, run_stop
    // NOTE: in idle state just looping through the standing
    let speed = 0.0012 * this.len;
    this.left = this.left + elapsedTime * speed;
    if (this.sprites[this.active].loop) {
      while (this.left >= this.len) {
        this.left -= this.len;
      }
    } else if (this.left >= this.len) {
      this.left = this.len - 1;
    }
    this.leftShift = -Math.floor(this.left) * this.stepW;
    this.topShift = -this.sprites[this.active].id * this.stepH;
    //console.log(this.left, elapsedTime * speed, this.leftShift);
  }
}
