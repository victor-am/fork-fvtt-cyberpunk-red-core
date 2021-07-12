/* eslint-disable no-undef */
/* eslint-disable max-classes-per-file */
/* global Roll */
import LOGGER from "../utils/cpr-logger.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import VerifyRoll from "../dialog/cpr-verify-roll-prompt.js";

export class CPRRoll {
  // Generic roll handler for CPR
  constructor(rollTitle, formula) {
    LOGGER.trace(`CPRRoll | Constructor`);
    // (private) the resulting Roll() object from Foundry
    this._roll = null;
    // (private) a stack of mods to apply to the roll
    this.mods = [];
    // a name for the roll, used in the UI
    this.rollTitle = rollTitle || this.template;
    // Store the die type and it can be used when displaying on the rollcard
    this.die = null;
    // this assumes exactly 1 term, "XdY", which is passed to Foundry's Roll()
    // any +A or -B terms are converted to mods
    this.formula = this._processFormula(formula);
    // the values of each face after a roll
    this.faces = [];
    // the result of the roll before applying mods or critical effects
    this.initialRoll = 0;
    // skip rolling a critical die, such as with death saves
    this.calculateCritical = true;
    // if a critical die was rolled, this is the stored result
    this.criticalRoll = 0;
    // the complete result of the roll after applying everything
    this.resultTotal = 0;
    // path to the right dialog box to pop up before rolling
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-generic-prompt.hbs";
    // path to the roll card template for chat
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs";
    // Any additional data we want to pass to the roll card
    this.rollCardExtraArgs = [];
  }

  _processFormula(formula) {
    LOGGER.trace(`CPRRoll | _processFormula`);
    const dice = /[0-9][0-9]*d[0-9][0-9]*/;
    const die = /d[0-9][0-9]*/;
    // cut out the XdY term, leaving only + or - terms after
    let rollMods = formula.replace(dice, "");
    if (rollMods !== "") {
      rollMods = rollMods.replace("+", " +");
      rollMods = rollMods.replace("-", " -");
      // split remaining terms into an array, add to mods
      const modArray = rollMods.split(" ");
      modArray.forEach((mod) => {
        if (mod !== "") {
          this.addMod(Number(mod));
        }
      });
    }
    // eslint-disable-next-line prefer-destructuring
    this.die = formula.match(die)[0];
    return formula.match(dice)[0];
  }

  addMod(mod) {
    if (mod !== 0) this.mods.push(mod);
  }

  totalMods() {
    return this.mods.length > 0 ? this.mods.reduce((a, b) => a + b) : 0;
  }

  async roll() {
    LOGGER.trace(`CPRRoll | roll`);
    // calculate the initial roll
    this._roll = await new Roll(this.formula).evaluate({ async: true });
    await DiceSoNice.ShowDiceSoNice(this._roll);
    this.initialRoll = this._roll.total;
    this.resultTotal = this.initialRoll + this.totalMods();
    this.faces = this._roll.terms[0].results.map((r) => r.result);

    // check and consider criticals (min or max # on die)
    if (this.wasCritical() && this.calculateCritical) {
      const critroll = await new Roll(this.formula).evaluate({ async: true });
      await DiceSoNice.ShowDiceSoNice(critroll);
      this.criticalRoll = critroll.total;
    }
    this._computeResult();
  }

  _computeBase() {
    // this MUST be called from roll()!
    return this.initialRoll + this.totalMods();
  }

  _computeResult() {
    LOGGER.trace(`CPRRoll | _computeResult`);
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

  async handleRollDialog(event) {
    LOGGER.trace(`CPRRoll | handleRollDialog`);

    // Handle skipping of the user verification step
    let skipDialog = event.ctrlKey;
    if (event.type === "click") {
      const ctrlSetting = game.settings.get("cyberpunk-red-core", "invertRollCtrlFunction");
      skipDialog = ctrlSetting ? !skipDialog : skipDialog;
    }

    if (!skipDialog) {
      const formData = await VerifyRoll.RenderPrompt(this).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        // returns false if the dialog was closed
        return false;
      }
      mergeObject(this, formData, { overwrite: true });
    }
    return true;
  }
}

export class CPRStatRoll extends CPRRoll {
  constructor(name, value) {
    super(name, "1d10");
    LOGGER.trace(`CPRStatRoll | Constructor`);
    this.statName = name;
    this.statValue = value;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-stat-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-stat-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.statValue;
  }

  setNetCombat(rollTitle) {
    this.rollTitle = rollTitle;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-stat-rollcard.hbs";
  }
}

export class CPRSkillRoll extends CPRStatRoll {
  constructor(statName, statValue, skillName, skillValue) {
    super(skillName, statValue);
    LOGGER.trace(`CPRSkillRoll | Constructor`);
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

export class CPRHumanityLossRoll extends CPRRoll {
  constructor(name, humanityLoss) {
    super(name, humanityLoss);
    LOGGER.trace(`CPRHumanityLossRoll | Constructor`);
    this.rollTitle = SystemUtils.Localize("CPR.dialog.installCyberware.humanityLoss");
    this.calculateCritical = false;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-humanity-loss-rollcard.hbs";
    this.cyberwareName = name;
  }
}

// while it would be cool to just pass in a weapon, the data model does not include
// the skill and stat entities that would be needed with it. Thought was given to extending
// classes for Ranged and Melee attacks (and hardcoding the stats used), but when considering
// aimed shots, this got into multiple inheritance. Decided not to cross that line. Maybe mix-ins?
export class CPRAttackRoll extends CPRSkillRoll {
  constructor(attackName, statName, statValue, skillName, skillValue, weaponType) {
    super(statName, statValue, skillName, skillValue);
    LOGGER.trace(`CPRAttackRoll | Constructor`);
    this.rollTitle = `${attackName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-attack-rollcard.hbs";
    this.weaponType = weaponType;
  }

  setNetCombat(rollTitle) {
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-program-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-attack-rollcard.hbs";
  }
}

// this deliberately does not set the location until after the verify dialog box
export class CPRAimedAttackRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    LOGGER.trace(`CPRAimedAttackRoll | Constructor`);
    this.rollTitle = `${weaponName}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-aimed-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-aimed-attack-rollcard.hbs";
    this.addMod(-8);
    this.location = "head";
  }
}

export class CPRAutofireRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    LOGGER.trace(`CPRAutofireRoll | Constructor`);
    this.rollTitle = `${weaponName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-autofire-rollcard.hbs";
  }
}

export class CPRSuppressiveFireRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    LOGGER.trace(`CPRSuppressiveFireRoll | Constructor`);
    this.rollTitle = `${weaponName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-suppressive-fire-rollcard.hbs";
  }
}

export class CPRRoleRoll extends CPRRoll {
  constructor(roleName, niceRoleName, statName, roleValue, roleStat, roleOther) {
    super(niceRoleName, "1d10");
    LOGGER.trace(`CPRRoleRoll | Constructor`);
    this.roleName = roleName;
    this.statName = statName;
    this.roleValue = roleValue;
    this.roleStat = roleStat;
    this.roleOther = roleOther;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-roleAbility-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-role-rollcard.hbs";
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.roleValue + this.roleStat + this.roleOther;
  }

  setNetCombat(rollTitle) {
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-cyberdeck-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-cyberdeck-rollcard.hbs";
  }
}
export class CPRDeathSaveRoll extends CPRRoll {
  constructor(penalty, basePenalty, bodyStat) {
    super(SystemUtils.Localize("CPR.rolls.deathSave.title"), "1d10");
    LOGGER.trace(`CPRDeathSaveRoll | Constructor`);
    this.calculateCritical = false;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-deathsave-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-deathsave-rollcard.hbs";
    // the ever-increasing penalty when death saves are made
    this.penalty = penalty;
    // a separate penalty from critical injuries
    this.basePenalty = basePenalty;
    // the value of the actor's body stat, used in the roll card
    this.bodyStat = bodyStat;
    // the result of the save, with "Success" or "Failure"
    this.saveResult = null;
  }

  totalMods() {
    return this.penalty + this.basePenalty;
  }
}

export class CPRDamageRoll extends CPRRoll {
  constructor(rollTitle, formula, weaponType) {
    // we assume always d6s
    // again, check if this makes sense or if it should accept formulas too
    super(rollTitle, formula);
    LOGGER.trace(`CPRDamageRoll | Constructor`);
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-damage-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs";
    // criticals just add 5 damage, they do not need more dice rolled
    this.calculateCritical = false;
    this.bonusDamage = 5;
    // are we aiming at something?
    this.isAimed = false;
    // for aimed shots, set to head, leg, or held item; set to body otherwise
    this.location = "body";
    // used in the verifyPrompt for damage rolls to show alt firemodes
    this.weaponType = weaponType;
    // indicate whether this is an autofire roll. Used when considering the +5 damage in crits
    this.isAutofire = false;
    // multiple damage by this amount
    this.autofireMultiplier = 0;
    // multiplier max
    this.autofireMultiplierMax = 0;
  }

  _computeBase() {
    this.autofireMultiplier = Math.min(this.autofireMultiplier, this.autofireMultiplierMax);
    const damageMultiplier = (this.isAutofire) ? this.autofireMultiplier : 1;
    return (this.initialRoll + this.totalMods()) * damageMultiplier;
  }

  // eslint-disable-next-line class-methods-use-this
  wasCritFail() {
    // you cannot crit-fail damage
    return false;
  }

  wasCritSuccess() {
    return this.faces.filter((x) => x === 6).length >= 2;
  }

  _computeResult() {
    // figure how aimed shots work...
    this.resultTotal = this._computeBase();
  }

  setAutofire() {
    this.isAutofire = true;
    this.formula = "2d6";
    this.mods = [];
  }

  configureAutofire(autofireMultiplier, autofireMultiplierMax = 0) {
    this.autofireMultiplier = autofireMultiplier;
    if (autofireMultiplierMax > this.autofireMultiplierMax) {
      this.autofireMultiplierMax = autofireMultiplierMax;
    }
  }

  setNetCombat(rollTitle) {
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-program-damage-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-damage-rollcard.hbs";
  }
}

export class CPRTableRoll extends CPRRoll {
  constructor(rollTitle, tableRoll, rollCard) {
    // This is just to create a CPR Roll Object from an already rolled RollTable
    const formula = tableRoll._formula;
    super(rollTitle, formula);
    LOGGER.trace(`CPRTableRoll | Constructor`);
    this.rollCard = rollCard;
    (tableRoll.terms[0].results).forEach((die) => {
      this.faces.push(die.result);
    });
    // eslint-disable-next-line prefer-destructuring
    this.resultTotal = tableRoll.result;
    this._roll = tableRoll;
  }
}

export const rollTypes = {
  BASE: "base",
  STAT: "stat",
  SKILL: "skill",
  HUMANITY: "humanity",
  ROLEABILITY: "roleAbility",
  ATTACK: "attack",
  AIMED: "aimed",
  AUTOFIRE: "autofire",
  SUPPRESSIVE: "suppressive",
  DAMAGE: "damage",
  DEATHSAVE: "deathsave",
  INTERFACEABILITY: "interfaceAbility",
  CYBERDECKPROGRAM: "cyberdeckProgram",
};
