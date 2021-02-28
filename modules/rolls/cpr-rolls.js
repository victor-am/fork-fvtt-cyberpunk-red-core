/* eslint-disable max-classes-per-file */
/* global Roll */
import LOGGER from "../utils/cpr-logger.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

export default class CPRRoll {
  // Generic roll handler for CPR
  constructor(rollTitle, formula) {
    // a name for the roll, used in the UI
    this.rollTitle = rollTitle || this.template;
    // this assumes exactly 1 term, "XdY", which is passed to Foundry's Roll()
    this.formula = formula || "1d10";
    // the values of each face after a roll
    this.faces = [];
    // the result of the roll before applying mods or critical effects
    this.initialRoll = 0;
    // if a critical die us rolled, this is the stored result
    this.criticalRoll = null;
    // the complete result of the roll after applying everything
    this.resultTotal = 0;
    // path to the right dialog box to pop up before rolling
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-base-prompt.hbs";
    // path to the roll card template for chat
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs";
    // (private) the resulting Roll() object from Foundry
    this._roll = null;
    // (private) a stack of mods to apply to the roll
    this.mods = [];
    LOGGER.log(`Created roll object`);
  }

  addMod(mod) {
    if (mod !== 0) this.mods.push(mod);
  }

  totalMods() {
    return this.mods.length > 0 ? this.mods.reduce((a, b) => a + b) : 0;
  }

  async roll() {
    // calculate the initial roll
    this._roll = new Roll(this.formula).roll();
    await DiceSoNice.ShowDiceSoNice(this._roll);
    this.initialRoll = this._roll.total;
    this.resultTotal = this.initialRoll + this.totalMods();

    // check and consider criticals (min or max # on die)
    if (this.wasCritical()) {
      const critroll = new Roll(this.formula).roll();
      await DiceSoNice.ShowDiceSoNice(critroll);
      this.criticalRoll = critroll.total;
    }

    this._computeResult();
    this.faces = this._roll.terms[0].results.map((r) => r.result);
  }

  _computeBase() {
    // this MUST be called from roll()!
    return this.initialRoll + this.totalMods();
  }

  _computeResult() {
    this.resultTotal = this._computeBase();
    if (this.wasCritFail()) {
      this.resultTotal += -1 * this.criticalRoll;
    } else {
      this.resultTotal += this.criticalRoll;
    }
  }

  wasCritical() {
    // return true or false indicating if a roll was critical
    return this.wasCritFail() || this.wasCritSuccess();
  }

  wasCritFail() {
    return this.initialRoll === 1;
  }

  wasCritSuccess() {
    return this.initialRoll === this._roll.terms[0].faces;
  }
}

export class CPRStatRoll extends CPRRoll {
  constructor(name, value) {
    super(name, "1d10");
    this.statValue = value;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-stat-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-stat-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.statValue;
  }
}

export class CPRSkillRoll extends CPRStatRoll {
  constructor(statName, statValue, skillName, skillValue) {
    super(skillName, statValue);
    this.statName = statName;
    this.skillValue = skillValue;
    this.skillName = skillName;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-skill-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-skill-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.statValue + this.skillValue;
  }
}

// while it would be cool to just pass in a weapon, the data model does not include
// the skill and stat entities that would be needed with it
export class CPRRangedAttackRoll extends CPRSkillRoll {
  constructor(weaponName, statValue, skillName, skillValue) {
    super(SystemUtils.Localize("CPR.ref"), statValue, skillName, skillValue);
    this.rollTitle = `${weaponName} ${SystemUtils.Localize("CPR.attack")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-attack-prompt.hbs";
  }
}

export class CPRMeleeAttackRoll extends CPRSkillRoll {
  constructor(weaponName, statValue, skillName, skillValue) {
    super(SystemUtils.Localize("CPR.dex"), statValue, skillName, skillValue);
    this.rollTitle = `${weaponName} ${SystemUtils.Localize("CPR.attack")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-attack-prompt.hbs";
  }
}

// Yep, CPRRoleRoll is almost the same as CRPStatRolls
export class CPRRoleRoll extends CPRRoll {
  constructor(roleName, roleValue) {
    super(roleName, "1d10");
    this.roleValue = roleValue;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-roleAbility-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-role-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.roleValue;
  }
}

export class CPRDamageRoll extends CPRRoll {
  constructor(rollTitle, numdice) {
    // we assume always d6s
    // again, check if this makes sense or if it should accept formulas too
    super(rollTitle, `${numdice}d6`);
    this.bonusDamage = 0;
    this.template = "damage";
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-damage-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll;
  }

  // eslint-disable-next-line class-methods-use-this
  wasCritFail() {
    // you cannot crit-fail damage
    return false;
  }

  wasCritSuccess() {
    return this._roll.faces.filter((x) => x === 6).length >= 2;
  }
}

export class CPRAutofireRoll extends CPRDamageRoll {
  constructor(rollTitle, multiplier) {
    super(rollTitle, "2d6");
    this.multiplier = multiplier;
    this.template = "autofire";
  }

  _computeBase() {
    return this.initialRoll * this.multiplier;
  }
}

/**

    // If this was autofire, add multiplier to the roll, otherwise just add the roll.
    if (rollResult.fireMode === "autofire") {
      rollResult.damageTotal = rollResult.diceTotal * rollResult.autofireMultiplier;
    } else {
      rollResult.damageTotal = rollResult.diceTotal;
    }

    // If we have 2 or more sixes on a damage roll, was critical is true.
    rollResult.wasCritical = rollResult.faces.filter((x) => x === 6).length >= 2;
    if (rollResult.wasCritical) {
      rollResult.bonusDamage = 5;
    }

    // Calculate total damage from attack.
    rollResult.damageTotal += rollResult.bonusDamage;

    // Calculate sum of all misc damage mods!
    if (rollResult.mods.length !== 0) {
      rollResult.modsTotal = rollResult.mods.reduce((a, b) => a + b);
      rollResult.damageTotal += rollResult.modsTotal;
    }

    return rollResult;
  }

class DeathSaveRoll extends CPRRoll {
    // TODO - Jay, fix me.
    "systems/cyberpunk-red-core/templates/chat/cpr-deathsave-rollcard.hbs";
  }
}

*/
