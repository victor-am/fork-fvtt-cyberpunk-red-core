export default class CPRBaseRollResult {
  constructor() {
    this.initialRoll = 0;
    this.wasCritical = false;
    this.criticalRoll = 0;
    this.rollTotal = 0;
    this.faces = [];
    this.mods = [];
    this.modsTotal = 0;
    this.bonusDamage = 0;
    this.checkTotal = 0;
    this.damageTotal = 0;
  }
}
