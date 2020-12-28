import LOGGER from "../utils/cpr-logger.js";

export function BaseRoll(stat = 0, skillLevel = 0, mods = [0], calculateCritical = true) {
  LOGGER.trace(`Calling baseRoll | Dice BaseRoll | Stat:${stat} SkillLevel:${skillLevel}, Mods:${mods}, CalculateCritical:${calculateCritical}`);

  // TODO- Roll Results could be constructed as objects outside of this.
  // TODO- Roll Results object structure needs revisted.
  let rollResult = {
    rollType: "BasicRoll",
    isCritical: false,
    criticalRoll: null,
    initialRoll: new Roll(`1d10`).roll().total,
    total: 0,
    finalRollResult: 0,
    resultMods: mods
  };

  if (calculateCritical) {
    LOGGER.debug(`Checking Critical Chance | Dice baseRoll | Initial Roll:${rollResult.initialRoll}`);
    if (rollResult.initialRoll == 1) {
      rollResult.isCritical = true;
      rollResult.criticalRoll = -1 * new Roll(`1d10`).roll().total;
      LOGGER.debug(`Critical Failure! | Dice baseRoll | Critical Roll:${rollResult.criticalRoll}`);
    }
    if (rollResult.initialRoll == 10) {
      rollResult.isCritical = true;
      rollResult.criticalRoll = new Roll(`1d10`).roll().total;
      LOGGER.debug(`Critical Success | Dice baseRoll | Critical Roll:${rollResult.criticalRoll}`);
    }
  }

  // TODO-- Move util function to a util class?
  let numOr0 = n => isNaN(n) ? 0 : parseInt(n)

  LOGGER.debug(`Calculate Roll Result! | Roll:${rollResult.initialRoll} + Crit:${rollResult.isCritical ? rollResult.criticalRoll : 0}`);
  rollResult.finalRollResult = rollResult.initialRoll + (rollResult.isCritical ? rollResult.criticalRoll : 0);
  
  LOGGER.debug(`Calculate Check Total! | Roll:${rollResult.finalRollResult} Skill:${skillLevel} + Stat:${stat} + Mods:${mods} (${mods.reduce((a, b) => numOr0(a) + numOr0(b))})`);
  rollResult.total = parseInt(rollResult.finalRollResult) + parseInt(skillLevel) + parseInt(stat) + parseInt(mods.reduce((a, b) => numOr0(a) + numOr0(b)));

  LOGGER.debug(`Check Total! | Total:${rollResult.total}`);

  return rollResult;
}

// TODO- Do not use as is.
export function DamageRoll(rollFormula = '1d6', location = "body") {
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

export function DeathSaveRoll() {

}

// Do we need this?
export function InitiateRoll() {

}
