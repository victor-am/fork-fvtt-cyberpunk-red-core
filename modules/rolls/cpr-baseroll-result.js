export default class CPRBaseRollResult {
  constructor() {
    this.wasCritical = false;
    this.criticalRoll = 0;
    this.initialRoll = 0;
    this.rollTotal = this.initialRoll;
    this.mods = [];
    this.modsTotal = 0;
    this.resultTotal = 0;
  }
};