export default class CPRDmgRollRequest {
  constructor() {
    // What's this?
    this.user = null;

    // To change the flow of _onRoll()
    this.rollType = "damage";
    this.isAutofire = false;
    this.multiplier = 1;
    this.mods = [];
    this.location = "body";
    this.isRanged = true;
    this.ablates = true;
    this.ignoreSP = 0; // 0=none, 1=half, 2=all
    this.aimData = {
      aimed: false,
      location: "",
    };
    this.weaponType = "";
  }
}
