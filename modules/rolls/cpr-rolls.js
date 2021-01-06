import LOGGER from "../utils/cpr-logger.js";
import CPRBaseRollResult from "./cpr-baseroll-result.js";
import CPRDmgRollResult from "./cpr-dmgroll-result.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat


export default class CPRRolls {

  static CPRRoll(formula, rollMode) {
    let roll = new Roll(formula).roll();
    DiceSoNice.ShowDiceSoNice(roll);
    return roll.total;
  }

  static BaseRoll(rollRequest) {
    LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${rollRequest.statValue} SkillLevel:${rollRequest.skillValue}, Mods:${rollRequest.mods}, CalculateCritical:${rollRequest.calculateCritical}`);

    // TODO- Verify use of mergeObject.
    let rollResult = new CPRBaseRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });
    LOGGER.debug(`Checking RollRequest | Dice BaseRoll | `);
    rollResult.initialRoll = this.CPRRoll(`1d10`);


    // With the above, below this line we ONLY need to use our Result!
    // Is this ideal? Or is this Heresy?
    if (rollResult.calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
      if (rollResult.initialRoll == 1) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = -1 * this.CPRRoll(`1d10[fire]`);
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
      if (rollResult.initialRoll == 10) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = this.CPRRoll(`1d10[fire]`);
        LOGGER.debug(`Critical Success | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
    }

    LOGGER.debug(`Calculate Roll Result! | Roll:${rollResult.initialRoll} + Crit:${rollResult.criticalRoll}`);
    rollResult.rollTotal = rollResult.initialRoll + rollResult.criticalRoll;

    LOGGER.debug(`Calculate Mods Total! | Mods:${rollResult.mods}`);
    rollResult.modsTotal = rollResult.mods.length > 0 ? rollResult.mods.reduce((a, b) => a + b) : 0;

    LOGGER.debug(`Calculate Check Total! | Roll:${rollResult.rollTotal} Skill:${rollResult.skillValue} + Stat:${rollResult.statValue} + Mods:${rollResult.mods} (${rollResult.modsTotal})`);
    rollResult.resultTotal = rollResult.rollTotal + rollResult.skillValue + rollResult.statValue + rollResult.modsTotal;

    LOGGER.debug(`Check Total! | Total:${rollResult.total}`);
    return rollResult;
  }

  static DamageRoll(rollRequest) {
    LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | RollFormula:${rollRequest.formula} Location: ${rollRequest.location}`);

    let rollResult = new CPRDmgRollResult();

  }

  static DeathSaveRoll() {

  }

  // Do we need this?
  static InitiateRoll() {

  }
}
