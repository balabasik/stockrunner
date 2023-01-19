const perkTypes = ["medic", "gift", "diamond", "bitcoin"];

function ExecuteBitcoin(physics, player, timeStamp, perkHash, activate) {
  if (!activate) return;
  // all the magic is reloaded
  player.stats.bitcoins++;
}

function GetPerkWh(type) {
  return [120, 120];
}

class Perk {
  constructor(id, type) {
    this.stats = {
      id: id,
      type: type,
      place: 0,
      position: [0, 0], // leftBottom x,y
      w: 0,
      h: 0,
    };
    [this.stats.w, this.stats.h] = GetPerkWh(type);
    this.onCapture = undefined;
    this.execute = ExecuteBitcoin;
  }
}

class PerkManager {
  constructor(onNewPerks, physics) {
    this.onNewPerks = onNewPerks;
    this.physics = physics;
    this.creationPlaces = this.physics.state.perkCreationPlaces;
    this.reinit();
  }

  reinit() {
    this.perks = {};
    this.freePlaces = {};
    for (let i = 0; i < this.creationPlaces.length; i++)
      this.freePlaces[i] = true;

    let initPerks = this.creationPlaces.length;
    for (let i = 0; i < initPerks; i++) this.createPerk(i);

    // NOTE: If more players are playing we create perks faster
    //this.timeout = setTimeout(this.delayedPerk.bind(this), 7000);
  }

  stop() {
    clearTimeout(this.timeout);
  }

  deletePerk(id) {
    delete this.perks[id];
    this.onNewPerks(this.perks);
  }

  createPerk(idx) {
    let id = idx;
    let type = "bitcoin"; //perkTypes[Math.floor(Math.random() * perkTypes.length)];
    let place = idx;
    let perk = new Perk(id, type);
    perk.stats.place = place;
    perk.stats.position = this.creationPlaces[place];
    this.perks[id] = perk;
    this.onNewPerks(this.perks);
  }
}

export default PerkManager;
//export { GetPerkMessage, GetPerkDescription, perkTypes };
