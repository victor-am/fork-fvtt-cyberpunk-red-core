// SETUP A DIALOG

import LOGGER from "../utils/cpr-logger.js";

// DETERIMNE ROLL TYPE

// MAKE ROLL OF TYPE WITH ARGS

// MERGE ROLL DATA INTO DIALOG

// RENDER DIALOG

// Base roll should calculate Critical by default.
// Base roll should expect a stat value, a skillBase value, and a list of mods to apply.
export async function BaseRoll(calculateCritical = true, stat = 0, skillBase = 0, mods = []) {
  LOGGER.trace(`Calling getProp Helper | Dice BaseRoll | Arg1:${arg1} Arg2:${arg2}, Arg3:${arg3}, Arg4:${arg4}`);
    // SKILL.val + STAT.val + [MODS]
    // 5 + 4 + sum([-2, 1, 1])

    // todo getChatDialog??

    let rollResult = {};
    let criticalRoll = 0;
    let initialRoll = new Roll(`1d10`).roll(); // Use input roll if exists, otherwise, roll randomly (used for editing a test result)
    
    // Adjust for crit
    if (calculateCritical) {
      LOGGER.debug(`Checking Critical Chance | Dice BaseRoll | Initial Roll:${initialRoll}`);
      if (roll._total == 1) {
        criticalRoll -= new Roll(`1d10`).roll();
        LOGGER.debug(`Critical Failure! | Dice BaseRoll | Critical Roll:${criticalRoll}`);
      }
      if (roll._total == 10) {
        criticalRoll += new Roll("1d10 + ").roll();
        LOGGER.debug(`Critical Success | Dice BaseRoll | Critical Roll:${criticalRoll}`);
      }
    }

    // Build results object for the dialog.
    rollResult.initialRoll = initialRoll;
    rollResult.criticalRoll = criticalRoll;
    rollResult.rollMods = mods;
    rollResult.result = initialRoll + criticalRoll + sum(mods)
    LOGGER.debug(`Roll Result | Dice BaseRoll`);
    console.log(rollResult);
    return rollResult;
}

export function DamageRoll() {

}

export function DeathSave() {

}

export function Initiative() {

}

// BASE: 1d10(w crits) + SOME + SOME + MOD
// DMG: xd6(two or more six, crit injury table) 
// DEATH: 1d10(die on 10) 
// I
