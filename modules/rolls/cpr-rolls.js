/* eslint-disable max-classes-per-file */
/* global Roll */
import LOGGER from "../utils/cpr-logger.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import CPRChat from "../chat/cpr-chat.js";

export default class CPRRoll {
  // Generic roll handler for CPR
  constructor(rollTitle, formula) {
    // (private) the resulting Roll() object from Foundry
    this._roll = null;
    // (private) a stack of mods to apply to the roll
    this.mods = [];
    // a name for the roll, used in the UI
    this.rollTitle = rollTitle || this.template;
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
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-base-prompt.hbs";
    // path to the roll card template for chat
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-base-rollcard.hbs";
    LOGGER.log(`Created roll object`);
  }

  _processFormula(formula) {
    const dice = /[0-9][0-9]*d[0-9][0-9]*/;
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
    return formula.match(dice)[0];
  }

  static getProto() {
    return { mods: String };
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
    this.faces = this._roll.terms[0].results.map((r) => r.result);

    // check and consider criticals (min or max # on die)
    if (this.wasCritical() && this.calculateCritical) {
      const critroll = new Roll(this.formula).roll();
      await DiceSoNice.ShowDiceSoNice(critroll);
      this.criticalRoll = critroll.total;
    }
    this._computeResult();
  }

  displayRoll() {
    CPRChat.RenderRollCard(this);
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

  // eslint-disable-next-line class-methods-use-this
  toLink() {
    throw new Error("Base rolls cannot be linked, use a subclass!");
  }
}

export class CPRStatRoll extends CPRRoll {
  constructor(name, value) {
    super(name, "1d10");
    this.statValue = value;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-stat-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-stat-rollcard.hbs";
  }

  static getProto() {
    return {
      mods: String,
      stat: Number,
    };
  }

  _computeBase() {
    return this.initialRoll + this.totalMods() + this.statValue;
  }

  toLink() {
    return `<a class="reroll" data-roll-type="stat" data-roll-title="${this.rollTitle}">
      <i class="fas fa-dice fg-red" title="Re-roll ${this.rollTitle}"></i>
    </a>`;
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
// the skill and stat entities that would be needed with it. Thought was given to extending
// classes for Ranged and Melee attacks (and hardcoding the stats used), but when considering
// aimed shots, this got into multiple inheritance. Decided not to cross that line. Maybe mix-ins?
export class CPRAttackRoll extends CPRSkillRoll {
  constructor(attackName, statName, statValue, skillName, skillValue, weaponType) {
    super(statName, statValue, skillName, skillValue);
    this.rollTitle = `${attackName} ${SystemUtils.Localize("CPR.attack")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-attack-rollcard.hbs";
    this.fireMode = "single";
    this.weaponType = weaponType;
  }
}

// this deliberately does not set the location until after the verify dialog box
export class CPRAimedAttackRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    this.rollTitle = `${weaponName} ${SystemUtils.Localize("CPR.aimedshot")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-aimed-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-aimed-attack-rollcard.hbs";
    this.addMod(-8);
    this.location = "head";
  }
}

export class CPRAutofireRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    this.rollTitle = `${weaponName} ${SystemUtils.Localize("CPR.autofire")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-autofire-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-autofire-rollcard.hbs";
    this.fireMode = "autofire";
  }
}

export class CPRSuppressiveFireRoll extends CPRAttackRoll {
  constructor(weaponName, statName, statValue, skillName, skillValue, weaponType) {
    super(weaponName, statName, statValue, skillName, skillValue, weaponType);
    this.rollTitle = `${weaponName} ${SystemUtils.Localize("CPR.suppressivefire")}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-suppressive-fire-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-suppressive-fire-rollcard.hbs";
    this.fireMode = "suppressive";
  }
}

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

export class CPRDeathSaveRoll extends CPRRoll {
  constructor(penalty, basePenalty, bodyStat) {
    super(SystemUtils.Localize("CPR.deathsave"), "1d10");
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
    this.autofireMultiplier = 1;
  }

  _computeBase() {
    return (this.initialRoll + this.totalMods()) * this.autofireMultiplier;
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
    if (this.wasCritical() && !this.isAutofire) {
      this.resultTotal += this.bonusDamage;
    }
  }

  setAutofire() {
    this.isAutofire = true;
    this.formula = "2d6";
  }
}
/*
export function rollPrototype(rollType) {
  switch (rollType) {
    case "stat": {
      return CPRStatRoll.getProto();
    }
    case "skill": {
      return CPRSkillRoll.getProto();
    }
    case "roleAbility": {
      return CPRRoleRoll.getProto();
    }
    case "attack": {
      return CPRAttackRoll.getProto();
    }
    case "suppressive":
    case "autofire": {
      return CPRAutofireRoll.getProto();
    }
    case "damage": {
      return CPRDamageRoll.getProto();
    }
    case "deathsave": {
      return CPRDeathSaveRoll.getProto();
    }
    default:
      return CPRRoll.getProto();
  }
}

export function rollFactory(args) {
  switch (args) {
    case "stat": {
      return new CPRStatRoll(args);
    }
    case "skill": {
      return CPRSkillRoll;
    }
    case "roleAbility": {
      return CPRRoleRoll;
    }
    case "attack": {
      return CPRAttackRoll;
    }
    case "suppressive":
    case "autofire": {
      return CPRAutofireRoll;
    }
    case "damage": {
      return CPRDamageRoll;
    }
    case "deathsave": {
      return CPRDeathSaveRoll;
    }
    default:
      return CPRRoll;
  }
}

// put this somewhere
export function chatListeners(html) {
  html.find(".reroll").click(() => this.reRoll());
}
*/
