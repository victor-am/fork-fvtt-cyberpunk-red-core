import LOGGER from "../utils/cpr-logger.js";
import BaseRollResult from "./cpr-baseroll-result.js";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat


export default class CPRRolls {
  static BaseRoll(stat = 0, skillLevel = 0, mods = [0], calculateCritical = true) {
    LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${stat} SkillLevel:${skillLevel}, Mods:${mods}, CalculateCritical:${calculateCritical}`);

    // TODO- Roll Results could be constructed as objects outside of this.
    // TODO- Roll Results object structure needs revisted.
    let rollResult = new BaseRollResult();
    
    if (calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
      if (rollResult.initialRoll == 1) {
        rollResult.isCritical = true;
        rollResult.criticalRoll = -1 * new Roll(`1d10`).roll().total;
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
      if (rollResult.initialRoll == 10) {
        rollResult.isCritical = true;
        rollResult.criticalRoll = new Roll(`1d10`).roll().total;
        LOGGER.debug(`Critical Success | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
    }

    LOGGER.debug(`Calculate Roll Result! | Roll:${rollResult.initialRoll} + Crit:${rollResult.isCritical ? rollResult.criticalRoll : 0}`);
    rollResult.finalRollResult = rollResult.initialRoll + (rollResult.isCritical ? rollResult.criticalRoll : 0);

    LOGGER.debug(`Calculate Check Total! | Roll:${rollResult.finalRollResult} Skill:${skillLevel} + Stat:${stat} + Mods:${mods} (${mods.reduce((a, b) => a + b)})`);
    rollResult.total = rollResult.finalRollResult + skillLevel + stat + mods.reduce((a, b) => a + b);

    LOGGER.debug(`Check Total! | Total:${rollResult.total}`);

    return rollResult;
  }

  // TODO- Do not use as is.
  static DamageRoll(rollFormula = '1d6', location = "body") {
    LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | RollFormula:${rollFormula} Location: ${location}`);

    // TODO- Roll Results could be constructed as objects outside of this.
    // TODO- Roll Results object structure needs revisted.
    let rollResult = {
      rollType: "DamageRoll",
      isCriticalInjury: false,
      location: location,
      initialRoll: new Roll(rollFormula).roll(),
      finalResult: 0
    };

    // Check for sixes choom!
    let sixes = 0;
    for (let roll in rollResult.initialRoll.terms.results) {
      LOGGER.debug(`Checking for Two Sixes | Dice DamageRoll | Current Result:${result}`);
      if (roll.result == 6) {
        sixes++
      }
    }

    // If sixes, set some info on this sick critical injury choom!
    if (sixes >= 2) {
      LOGGER.debug(`Critical Injury! | Dice DamageRoll | Sixes:${sixes}`);
      rollResult.isCriticalInjury = true;
    }

    // Build results object for the dialog.
    rollResult.finalResult += initialRoll._total;
    LOGGER.debug(`Roll Result | Dice baseRoll`);
    console.log(rollResult);
    return rollResult;
  }

  static DeathSaveRoll() {

  }

  // Do we need this?
  static InitiateRoll() {

  }
}
