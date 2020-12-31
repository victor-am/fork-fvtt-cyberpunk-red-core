export default class BaseRollResult {
  constructor() {
    this.rollType = "BasicRoll";
    this.isCritical = false;
    this.criticalRoll = 0;
    this.initialRoll = new Roll(`1d10`).roll().total;
    this.total = 0;
    this.finalRollResult = 0;
    this.resultMods = [];
  }
};