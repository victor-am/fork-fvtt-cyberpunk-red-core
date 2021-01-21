/* global Roll, mergeObject */
import LOGGER from "../utils/cpr-logger";
import CPRBaseRollResult from "./cpr-baseroll-result";
import CPRDamageRollResult from "./cpr-dmgroll-result";
import DiceSoNice from "../extern/cpr-dice-so-nice";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat

// 1dp

// /r 1d10 + 10

export default class CPRRolls {
  // Generic roll handler for CPR
  static CPRRoll(formula) {
    const roll = new Roll(formula).roll();
    DiceSoNice.ShowDiceSoNice(roll);
    return {
      total: roll.total,
      array: roll.terms[0].results.map((r) => r.result),
    };
  }

  static BaseRoll(rollRequest) {
    LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${rollRequest.statValue} SkillLevel:${rollRequest.skillValue}, Mods:${rollRequest.mods}, CalculateCritical:${rollRequest.calculateCritical}`);

    // TODO- Verify use of mergeObject.
    const rollResult = new CPRBaseRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });
    rollResult.initialRoll = this.CPRRoll("1d10").total;

    // With the above, below this line we ONLY need to use our Result!
    // Is this ideal? Or is this Heresy?
    if (rollResult.calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
      if (rollResult.initialRoll === 1) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = -1 * this.CPRRoll("1d10[fire]").total;
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
      if (rollResult.initialRoll === 10) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = this.CPRRoll("1d10[fire]").total;
        LOGGER.debug(`Critical Success | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
    }

    LOGGER.debug(`Calculate Roll Result! | Roll:${rollResult.initialRoll} + Crit:${rollResult.criticalRoll}`);
    rollResult.rollTotal = rollResult.initialRoll + rollResult.criticalRoll;

    LOGGER.debug(`Calculate Mods Total! | Mods:${rollResult.mods}`);
    rollResult.modsTotal = rollResult.mods.length > 0 ? rollResult.mods.reduce((a, b) => a + b) : 0;

    LOGGER.debug(`Calculate Check Total! | Roll:${rollResult.rollTotal} Skill:${rollResult.skillValue} + Stat:${rollResult.statValue} + Mods:${rollResult.mods} (${rollResult.modsTotal})`);

    rollResult.resultTotal = rollResult.rollTotal + rollResult.modsTotal;
    if (rollResult.roleValue > 0) {
      rollResult.resultTotal += rollResult.roleValue;
    } else {
      rollResult.resultTotal += rollResult.skillValue + rollResult.statValue;
    }

    LOGGER.debug(`Check Total! | Total:${rollResult.total}`);
    return rollResult;
  }

  static DamageRoll(rollRequest) {
    LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | RollFormula:${rollRequest.formula} Location: ${rollRequest.location}`);

    const rollResult = new CPRDamageRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });

    // create roll and show Dice So Nice!
    const roll = this.CPRRoll(`${rollRequest.formula}[fire]`);

    // Push all results into diceResults
    roll.array.forEach((r) => rollResult.diceResults.push(r));

    // Get roll Total
    rollResult.diceTotal = roll.total;

    // If autofire, apply multiplier.
    if (rollResult.isAutofire) rollResult.diceTotal *= rollResult.multiplier;

    // count crits and bonus damage
    let sixes = 0;
    rollResult.diceResults.forEach((r) => {
      if (r === 6) sixes += 1;
    });

    rollResult.crits = Math.floor(sixes / 2);
    rollResult.bonusDamage = rollResult.crits * 5;
    rollResult.wasCritical = !!rollResult.crits > 0;

    // get total attack damage
    rollResult.resultTotal = rollResult.diceTotal + rollResult.bonusDamage;

    // add all mods!
    if (rollResult.mods.length !== 0) {
      rollResult.mods = rollResult.mods.reduce((a, b) => a + b);
      rollResult.resultTotal += rollResult.mods;
    }

    return rollResult;
  }

  static DeathSaveRoll() {
    // TODO - Jay, fix me.
  }
}
