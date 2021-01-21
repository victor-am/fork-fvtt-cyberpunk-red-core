export default class CPRRollRequest {
  constructor() {
    this.user = null;
    // To change the flow of _onRoll()
    this.rollTitle = "";
    this.rollType = "";
    this.calculateCritical = true;
    this.statValue = 0;
    this.skillValue = 0;
    this.roleAbilityValue = 0;
    this.mods = [];
    // FUTURE PROOFING, NOT IN USE
    this.shouldAblate = true;
    this.ignoreSP = 0;
    this.fireMode = "";
    this.isAimed = false;
    this.location = "body";
    this.isRanged = true;
    this.weaponType = "";
    this.user = null;
    this.debug = false;
  }
}
