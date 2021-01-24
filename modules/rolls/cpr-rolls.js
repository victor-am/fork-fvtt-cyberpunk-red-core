/* global Roll, mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import CPRRollResult from "./cpr-roll-result.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat

// 1dp

// /r 1d10 + 10

export default class CPRRolls {
  // Generic roll handler for CPR
  static async CPRRoll(formula) {
    const roll = new Roll(formula).roll();
    await DiceSoNice.ShowDiceSoNice(roll);
    return {
      total: roll.total,
      faces: roll.terms[0].results.map((r) => r.result),
    };
  }

  static async BaseRoll(rollRequest) {
    LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${rollRequest.statValue} SkillLevel:${rollRequest.skillValue}, Mods:${rollRequest.mods}, CalculateCritical:${rollRequest.calculateCritical}`);

    // TODO- Verify use of mergeObject.
    const rollResult = new CPRRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });
    rollResult.initialRoll = (await this.CPRRoll("1d10")).total;

    // With the above, below this line we ONLY need to use our Result!
    // Is this ideal? Or is this Heresy?
    if (rollResult.calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
      if (rollResult.initialRoll === 1) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = -1 * (await this.CPRRoll("1d10[fire]")).total;
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
      if (rollResult.initialRoll === 10) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = (await this.CPRRoll("1d10[fire]")).total;
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

  // TODO - Refactor Function
  static DamageRoll(rollRequest) {
    LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | RollFormula:${rollRequest.formula} Location: ${rollRequest.location}`);

    const rollResult = new CPRRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });

    // create roll and show Dice So Nice!
    const roll = this.CPRRoll(`${rollRequest.formula}[fire]`);

    // Push all results into diceResults
    rollResult.faces = roll.faces;
    rollResult.diceTotal = roll.total;

    // If we have 2 or more sixes on a damage roll, was critical is true.
    rollResult.wasCritical = rollResult.faces.filter((x) => x === 6).length >= 2;
    if (rollResult.wasCritical) {
      rollResult.bonusDamage = 5;
    }

    // Calculate total damage from attack.
    rollResult.damageTotal = rollResult.diceTotal + rollResult.bonusDamage;

    // Calculate sum of all misc damage mods!
    if (rollResult.mods.length !== 0) {
      rollResult.modsTotal = rollResult.mods.reduce((a, b) => a + b);
      rollResult.damageTotal += rollResult.modsTotal;
    }

    return rollResult;
  }

  static DeathSaveRoll() {
    // TODO - Jay, fix me.
  }
}
