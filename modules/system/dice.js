// SETUP A DIALOG

import LOGGER from "../utils/cpr-logger.js";

// DETERIMNE ROLL TYPE

// MAKE ROLL OF TYPE WITH ARGS

// MERGE ROLL DATA INTO DIALOG

// RENDER DIALOG

// Base roll should calculate Critical by default.
// Base roll should expect a stat value, a skillBase value, and a list of mods to apply.
export function BaseRoll(stat = 0, skillLevel = 0, mods = [0], calculateCritical = true) {
  LOGGER.trace(`Calling baseRoll | Dice baseRoll | Stat:${stat} SkillLevel:${skillLevel}, Mods:${mods}, CalculateCritical:${calculateCritical}`);

  // TODO- Roll Results could be constructed as objects outside of this.
  let rollResult = {
    rollType: "basicRoll",
    isCritical: false,
    criticalRoll: null,
    initialRoll: new Roll(`1d10`).roll(),
    total: 0,
    finalRollResult: 0,
    resultMods: mods
  };

  // Choom
  // Adjust for crit
  if (calculateCritical) {
    LOGGER.debug(`Checking Critical Chance | Dice baseRoll | Initial Roll:${rollResult.initialRoll._total}`);
    if (rollResult.initialRoll._total == 1) {
      rollResult.isCritical = true;
      rollResult.criticalRoll = new Roll(`1d10`).roll();
      // Make roll negative
      rollResult.criticalRoll._total = 0 - rollResult.criticalRoll._total;
      LOGGER.debug(`Critical Failure! | Dice baseRoll | Critical Roll:${rollResult.criticalRoll._total}`);
    }
    if (rollResult.initialRoll._total == 10) {
      rollResult.isCritical = true;
      rollResult.criticalRoll = new Roll(`1d10`).roll();
      LOGGER.debug(`Critical Success | Dice baseRoll | Critical Roll:${rollResult.criticalRoll._total}`);
    }
  }

  // TODO-- Move util function to a util class?
  let numOr0 = n => isNaN(n) ? 0 : n
  
  // Build results object for the dialog.
  LOGGER.debug(`Calculate Final Roll Result! | Roll:${rollResult.initialRoll._total} + Crit:${rollResult.isCritical ? rollResult.criticalRoll._total : 0}`);
  rollResult.finalRollResult = rollResult.initialRoll._total + (rollResult.isCritical ? rollResult.criticalRoll._total : 0);
  
  LOGGER.debug(`Calculate Total! | Dice baseRoll | Roll:${rollResult.finalRollResult} Skill:${skillLevel} + Stat:${stat} + Mods:${mods} (${mods.reduce((a, b) => numOr0(a) + numOr0(b))})`);
  rollResult.total = rollResult.finalRollResult + skillLevel + stat + mods.reduce((a, b) => numOr0(a) + numOr0(b));
  console.log(rollResult);
  return rollResult;
}

export function DamageRoll(rollFormula = '1d6', location = "body") {
  LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | RollFormula:${rollFormula} Location: ${location}`);

  // TODO- Roll Results could be constructed as objects outside of this.
  let rollResult = {
    rollType: "damageRoll",
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

export function DeathSaveRoll() {

}

// Do we need this?
export function InitiateRoll() {

}
