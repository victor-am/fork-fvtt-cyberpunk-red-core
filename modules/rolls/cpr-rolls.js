import LOGGER from "../utils/cpr-logger.js";
import CPRBaseRollResult from "./cpr-baseroll-result.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat

export default class CPRRolls {
  static CPRRoll(formula, rollMode) {
    let roll = new Roll(formula).roll();
    DiceSoNice.ShowDiceSoNice(roll);
    return {
      total: roll.total,
      array: roll.terms[0].results.map((roll) => roll.result)
    };
  }

  static BaseRoll(rollRequest) {
    LOGGER.trace(
      `Calling baseRoll | Dice BaseRoll | Stat:${rollRequest.statValue} SkillLevel:${rollRequest.skillValue}, Mods:${rollRequest.mods}, CalculateCritical:${rollRequest.calculateCritical}`
    );

    // TODO- Verify use of mergeObject.
    let rollResult = new CPRBaseRollResult();
    mergeObject(rollResult, rollRequest, { overwrite: true });
    LOGGER.debug(`Checking RollRequest | Dice BaseRoll | `);
    rollResult.initialRoll = this.CPRRoll(`1d10`).total;

    // With the above, below this line we ONLY need to use our Result!
    // Is this ideal? Or is this Heresy?
    if (rollResult.calculateCritical) {
      LOGGER.debug(
        `Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`
      );
      if (rollResult.initialRoll == 1) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = -1 * this.CPRRoll(`1d10[fire]`).total;
        LOGGER.debug(
          `Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`
        );
      }
      if (rollResult.initialRoll == 10) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = this.CPRRoll(`1d10[fire]`).total;
        LOGGER.debug(
          `Critical Success | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`
        );
      }
    }

    LOGGER.debug(
      `Calculate Roll Result! | Roll:${rollResult.initialRoll} + Crit:${rollResult.criticalRoll}`
    );
    rollResult.rollTotal = rollResult.initialRoll + rollResult.criticalRoll;

    LOGGER.debug(`Calculate Mods Total! | Mods:${rollResult.mods}`);
    rollResult.modsTotal =
      rollResult.mods.length > 0 ? rollResult.mods.reduce((a, b) => a + b) : 0;

    LOGGER.debug(
      `Calculate Check Total! | Roll:${rollResult.rollTotal} Skill:${rollResult.skillValue} + Stat:${rollResult.statValue} + Mods:${rollResult.mods} (${rollResult.modsTotal})`
    );
    rollResult.resultTotal =
      rollResult.rollTotal +
      rollResult.skillValue +
      rollResult.statValue +
      rollResult.modsTotal;

    LOGGER.debug(`Check Total! | Total:${rollResult.total}`);
    return rollResult;
  }

  static DamageRoll(rollRequest) {
    LOGGER.trace(
      `Calling DamageRoll | Dice DamageRoll | RollFormula:${rollRequest.formula} Location: ${rollRequest.location}`
    );

    let rollResult = {};
    mergeObject(rollResult, rollRequest, { overwrite: true });
    LOGGER.debug(`Checking RollRequest | Dice DmgRoll | `);

    // create roll and show Dice So Nice!
    let roll = this.CPRRoll(rollRequest.formula);

    // get result array
    rollResult.diceResults = roll.array;

    // get dice total
    rollResult.diceTotal = roll.total;

    // count crits and bonus damage
    let sixes = 0;
    rollResult.diceResults.forEach((r) => {
      if (r === 6) sixes++;
    });
    rollResult.crits = Math.floor(sixes / 2);
    rollResult.bonusDamage = rollResult.crits * 5;
    rollResult.wasCritical = !!rollResult.crits > 0;

    // get total attack damage
    rollResult.resultTotal = rollResult.diceTotal + rollResult.bonusDamage;

    return rollResult;
  }

  static DeathSaveRoll() {}

  // Do we need this?
  static InitiateRoll() {}
}
