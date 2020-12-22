// SETUP A DIALOG

// DETERIMNE ROLL TYPE

// MAKE ROLL OF TYPE WITH ARGS

// MERGE ROLL DATA INTO DIALOG

// RENDER DIALOG

export async function BaseRoll(rollData = "1d10", calculateCritical = false) {
    // SKILL.val + STAT.val + [MODS]
    // 5 + 4 + [-2, 1, 1]
    // base = skill.value + stat.value
    // for mod in mods [base+=mod]
    // roll result + base
    // result
    let roll = new Roll(rollData).roll(); // Use input roll if exists, otherwise, roll randomly (used for editing a test result)
    // Adjust for crit
    if (calculateCritical) {
      if (roll._total == 1) {
        roll = new Roll("1d10 - " + roll.result).roll();
      }
      let rollData = baseRollData.split("d", 2);
      let maxRoll = parseInt(rollData[0]) * parseInt(rollData[1]);
      if (roll._total == maxRoll) {
        roll = new Roll("1d10 + " + roll.result).roll();
      }
    }
    return roll;
}

export async function DamageRoll() {

}

export async function DeathSave() {

}

export async function Initiative() {

}

// BASE: 1d10(w crits) + SOME + SOME + MOD
// DMG: xd6(two or more six, crit injury table) 
// DEATH: 1d10(die on 10) 
// I
