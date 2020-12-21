// SETUP A DIALOG

// DETERIMNE ROLL TYPE

// MAKE ROLL OF TYPE WITH ARGS

// MERGE ROLL DATA INTO DIALOG

// RENDER DIALOG

export function BaseRoll(rollData) {
    // SKILL.val + STAT.val + [MODS]
    // 5 + 4 + [-2, 1, 1]
    // base = skill.value + stat.value
    // for mod in mods [base+=mod]
    // roll result + base
    // result
    let roll = new Roll("1d10").roll(); // Use input roll if exists, otherwise, roll randomly (used for editing a test result)
    // Adjust for crit
    if (criticalSuccess) {

    } else if (criticalFailure) {

    }
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