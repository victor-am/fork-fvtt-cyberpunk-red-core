// SETUP A DIALOG

import LOGGER from "../utils/cpr-logger.js";

// DETERIMNE ROLL TYPE

// MAKE ROLL OF TYPE WITH ARGS

// MERGE ROLL DATA INTO DIALOG

// RENDER DIALOG

// Base roll should calculate Critical by default.
// Base roll should expect a stat value, a skillBase value, and a list of mods to apply.
export async function BaseRoll(calculateCritical = true, stat = 0, skillLevel = 0, mods = []) {
  LOGGER.trace(`Calling BaseRoll | Dice BaseRoll | Arg1:${calculateCritical} Arg2:${stat}, Arg3:${skillLevel}, Arg4:${mods}`);

  // TODO- Roll Results could be constructed as objects outside of this.
  let rollResult = {
    criticalRoll: 0,
    initialRoll: new Roll(`1d10`).roll(),
    finalRollResult: 0,
    resultTotal: 0,
    resultMods: mods
  };

  // Adjust for crit
  if (calculateCritical) {
    LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${rollResult.initialRoll}`);
    if (roll._total == 1) {
      rollResult.criticalRoll -= new Roll(`1d10`).roll();
      LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
    }
    if (roll._total == 10) {
      rollResult.criticalRoll += new Roll("1d10 + ").roll();
      LOGGER.debug(`Critical Success | Dice BaseRoll | Critical Roll:${rollResult.criticalRoll}`);
    }
  }

  // TODO-- Move util function to a util class?
  let numOr0 = n => isNaN(n) ? 0 : n
  // Build results object for the dialog.
  rollResult.finalRollResult += initialRoll._total + criticalRoll_total;
  rollResult.resultTotal += roll.finalRollResult + skillLevel + stat + mods.reduce((a, b) => numOr0(a) + numOr0(b));
  
  LOGGER.debug(`Roll Result | Dice BaseRoll`);
  console.log(rollResult);
  return rollResult;
}

export function DamageRoll(rollFormula = '1d6', location = "body") {
  LOGGER.trace(`Calling DamageRoll | Dice DamageRoll | Arg1:${rollFormula}`);

  // TODO- Roll Results could be constructed as objects outside of this.
  let rollResult = {
    isCriticalInjury: false,
    location: location,
    criticalInjury: "",
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
    rollResult.criticalInjury = "Something Bad";
  }

  // Build results object for the dialog.
  rollResult.finalResult += initialRoll._total;
  LOGGER.debug(`Roll Result | Dice BaseRoll`);
  console.log(rollResult);
  return rollResult;
}

export function DeathSave() {

}

export function Initiative() {

}
