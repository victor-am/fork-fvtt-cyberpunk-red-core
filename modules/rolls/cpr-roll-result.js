export default class CPRBaseRollResult {
  constructor() {
    this.initialRoll = 0;
    this.wasCritical = false;
    this.criticalRoll = 0;
    this.rollTotal = 0;
    this.mods = [];
    this.modsTotal = 0;
    this.rollResults = [];
    this.bonusDamage = 0;
    this.checkTotal = 0;
    this.damageTotal = 0;
  }
}
