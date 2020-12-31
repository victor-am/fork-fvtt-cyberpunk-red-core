import LOGGER from "../utils/cpr-logger.js";
import CPRBaseRollResult from "./cpr-baseroll-result.js";

// RollRequest (per type)
// --> Work
// RollResult (per type)
// --> Output To Chat


export default class CPRRolls {
  static BaseRoll(rollRequest) {
    LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${rollRequest.statValue} SkillLevel:${rollRequest.skillValue}, Mods:${rollRequest.mods}, CalculateCritical:${rollRequest.calculateCritical}`);

    // TODO- Verify use of mergeObject.
    let rollResult = new CPRBaseRollResult();
    mergeObject(rollResult, rollRequest, {overwrite: true});
    LOGGER.debug(`Checking RollRequest | Dice BaseRoll | `);
    console.log(rollResult);
    
    // With the above, below this line we ONLY need to use our Result!
    // Is this ideal? Or is this Heresy?
    if (rollResult.calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
      if (rollResult.initialRoll == 1) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = -1 * new Roll(`1d10`).roll().total;
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
      }
      if (rollResult.initialRoll == 10) {
        rollResult.wasCritical = true;
        rollResult.criticalRoll = new Roll(`1d10`).roll().total;
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
