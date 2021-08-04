/* eslint-disable max-classes-per-file */
/* global Roll game mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import DiceSoNice from "../extern/cpr-dice-so-nice.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import VerifyRoll from "../dialog/cpr-verify-roll-prompt.js";

/**
 * This is a generic CPR roll object. It builds in critical success and failure
 * mechanics on top of using the Foundry roll objects.
 */
export class CPRRoll {
  /**
   * See the property comments below for details. Note that after constructing the object
   * the roll() method still needs to be called to actually "roll."
   *
   * @constructor
   * @param {String} rollTitle - a name for the roll which is used in the roll card (chat message)
   * @param {String} formula - a string representing what should be rolled using Foundry roll logic
   */
  constructor(rollTitle, formula) {
    LOGGER.trace("constructor | CPRRoll | Called.");
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

  /**
   * In our roll object we separate out mods (+1, -2, etc) into a property. This is convenient for checking
   * for an applying critical events (success or failure) to the result.
   *
   * @param {String} formula - a string representing what should be rolled using Foundry roll logic
   * @returns {String} - the dice formula itself, in the form (XdY)
   */
  _processFormula(formula) {
    LOGGER.trace("_processFormula | CPRRoll | Called.");
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
    [this.die] = formula.match(die);
    return this.die;
  }

  /**
   * Apply a mod to the roll. This is a stack of integers that get summed later on
   *
   * @param {Number} mod - the mod to apply to the roll
   */
  addMod(mod) {
    LOGGER.trace("addMod | CPRRoll | Called.");
    if (mod !== 0) this.mods.push(mod);
  }

  /**
   * Assuming there are mods for the roll, add them all up.
   *
   * @returns {Number} - the sum of the mods applied so far
   */
  totalMods() {
    LOGGER.trace("totalMods | CPRRoll | Called.");
    return this.mods.length > 0 ? this.mods.reduce((a, b) => a + b) : 0;
  }

  /**
   * The most important method. Perform the roll and save the results to the CPRRoll object.
   * Because of the integration with DiceSoNice, this is intentionally an async method.
   *
   * @async
   */
  async roll() {
    LOGGER.trace("roll | CPRRoll | Called.");
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

  /**
   * Simple method to compute the initial roll result and mods. This does not take
   * critical events into account.
   * Important: This MUST be called from roll()!
   *
   * @private
   * @returns {Number} - the results of a roll without considering critical events
   */
  _computeBase() {
    LOGGER.trace("_computeBase | CPRRoll | Called.");
    return this.initialRoll + this.totalMods();
  }

  /**
   * After rolling the initial die (d10) and handling critical events (like another
   * die roll to subtract another d10 for a crit fail), sum and save the results.
   *
   * @private
   */
  _computeResult() {
    LOGGER.trace("_computeResult | CPRRoll | Called.");
    this.resultTotal = this._computeBase();
    if (this.wasCritFail()) {
      this.resultTotal += -1 * this.criticalRoll;
    } else {
      this.resultTotal += this.criticalRoll;
    }
  }

  /**
   * Return a boolean indicating whether a critical event (fail or success) happened
   *
   * @returns {Boolean}
   */
  wasCritical() {
    LOGGER.trace("wasCritical | CPRRoll | Called.");
    // return true or false indicating if a roll was critical
    return this.wasCritFail() || this.wasCritSuccess();
  }

  /**
   * Return T/F whether a critical failure happened. This is separated out to be overridden
   * by child classes later on.
   *
   * @returns {Boolean}
   */
  wasCritFail() {
    LOGGER.trace("wasCritFail | CPRRoll | Called.");
    return this.initialRoll === 1;
  }

  /**
   * Return T/F whether a critical success happened. This is separated out to be overridden
   * by child classes later on.
   *
   * @returns {Boolean}
   */
  wasCritSuccess() {
    LOGGER.trace("wasCritSuccess | CPRRoll | Called.");
    return this.initialRoll === this._roll.terms[0].faces;
  }

  /**
   * Pop up the roll confirmation dialog box. This enables a player to confirm the stat, skill,
   * and any mods before making the roll.
   *
   * @param {} event - an object representing a click event
   * @returns {Boolean}
   */
  async handleRollDialog(event) {
    LOGGER.trace("handleRollDialog | CPRRoll | Called.");

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

/**
 * A stat roll extends the generic CPRRoll to include the value for a stat in the roll. e.g. "roll INT"
 */
export class CPRStatRoll extends CPRRoll {
  constructor(name, value) {
    LOGGER.trace("constructor | CPRStatRoll | Called.");
    super(name, "1d10");
    this.statName = name;
    this.statValue = value;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-stat-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-stat-rollcard.hbs";
  }

  /**
   * This override is where the stat value is included in the roll results.
   *
   * @override
   * @private
   * @returns {Number}
   */
  _computeBase() {
    LOGGER.trace("_computeBase | CPRStatRoll | Called.");
    return this.initialRoll + this.totalMods() + this.statValue;
  }

  /**
   * Flip this roll to stat role from a program, which has a special name and card design.
   *
   * @param {String} rollTitle - a title for the roll, shown in the roll card (chat message)
   */
  setNetCombat(rollTitle) {
    LOGGER.trace("setNetCombat | CPRStatRoll | Called.");
    this.rollTitle = rollTitle;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-stat-rollcard.hbs";
  }
}

/**
 * The skill roll incorporates the stat, skill, and role details. Roles sometimes influence skill checks
 * (e.g. moto).
 *
 * To Do: when we get to active effects, this design may need to be revisited.
 */
export class CPRSkillRoll extends CPRStatRoll {
  /**
   * @constructor
   * @param {String} statName - name of the stat used with this roll
   * @param {Number} statValue - value of the stat
   * @param {String} skillName - name of the skill for the roll
   * @param {Number} skillValue - value of the skill level
   * @param {String} roleName - name of a role that affects the roll
   * @param {Number} roleValue - value of said role
   * @param {String} universalBonusAttack - a blanket mod bestowed by certain abilities or items
   */
  constructor(statName, statValue, skillName, skillValue, roleName, roleValue, universalBonusAttack) {
    LOGGER.trace("constructor | CPRSkillRoll | Called.");
    super(skillName, statValue);
    this.statName = statName;
    this.skillName = skillName;
    this.skillValue = skillValue;
    this.roleName = roleName;
    this.roleValue = roleValue;
    this.universalBonusAttack = universalBonusAttack;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-skill-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-skill-rollcard.hbs";
  }

  /**
   * This override is where the stat, skill, and role values are included in the roll results.
   *
   * @override
   * @private
   * @returns {Number}
   */
  _computeBase() {
    LOGGER.trace("_computeBase | CPRSkillRoll | Called.");
    if (this.universalBonusAttack) {
      return this.initialRoll + this.totalMods() + this.statValue + this.skillValue + this.roleValue + this.universalBonusAttack;
    }
    return this.initialRoll + this.totalMods() + this.statValue + this.skillValue + this.roleValue;
  }
}

/**
 * The roll for decreasing Humanity when cyberware is installed, usually a number of d6s.
 */
export class CPRHumanityLossRoll extends CPRRoll {
  /**
   * @constructor
   * @param {String} name - the name of the cyberware being installed, incurring the loss
   * @param {String} humanityLoss - a roll formula
   */
  constructor(name, humanityLoss) {
    LOGGER.trace("constructor | CPRHumanityLossRoll | Called.");
    super(name, humanityLoss);
    this.rollTitle = SystemUtils.Localize("CPR.dialog.installCyberware.humanityLoss");
    this.calculateCritical = false;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-humanity-loss-rollcard.hbs";
    this.cyberwareName = name;
  }
}

/**
 * Attack rolls function just like skill rolls but we keep track of the weapon type for damage calculations
 * later on. They have a specialized roll card too.
 *
 * While it would be cool to just pass in a weapon to the constructor, the data model does not include
 * the skill and stat entities that would be needed with it. Thought was given to extending
 * classes for Ranged and Melee attacks (and hardcoding the stats used), but when considering
 * aimed shots, this got into multiple inheritance. Decided not to cross that line. Maybe mix-ins or interfaces?
 */
export class CPRAttackRoll extends CPRSkillRoll {
  /**
   * TODO: 9 arguments is a lot
   *
   * @constructor
   * @param {String} attackName - a name for the attack. Used in the roll card (chat message)
   * @param {String} statName - name for the stat
   * @param {Number} statValue - value of said stat
   * @param {String} skillName - name for the skill to be considered
   * @param {Number} skillValue - value of said skill
   * @param {String} roleName - name of the role if applicable
   * @param {Number} roleValue - value of said role
   * @param {String} weaponType - type of the weapon which is embedded in links to damage rolls in the roll card
   * @param {Number} universalBonusAttack - high level bonus provided by some role abilities and items
   */
  constructor(attackName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack) {
    LOGGER.trace("constructor | CPRAttackRoll | Called.");
    super(statName, statValue, skillName, skillValue, roleName, roleValue, universalBonusAttack);
    this.rollTitle = `${attackName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-attack-rollcard.hbs";
    this.weaponType = weaponType;
  }

  /**
   * Flip this roll to stat role from a program, which has a special name, prompt, and card design.
   *
   * @param {String} rollTitle - a title for the roll, shown in the roll card (chat message)
   */
  setNetCombat(rollTitle) {
    LOGGER.trace("setNetCombat | CPRAttackRoll | Called.");
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-program-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-attack-rollcard.hbs";
  }
}

/**
 * Aimed attack rolls are the same as attack rolls, but they record the location and a -8 mod. The roll prompt
 * and card is slightly different too.
 */
export class CPRAimedAttackRoll extends CPRAttackRoll {
  /**
   * Note: this deliberately does not set the location until after the verify dialog box (in sheet code)
   *
   * @constructor
   * @param {String} attackName - a name for the attack. Used in the roll card (chat message)
   * @param {String} statName - name for the stat
   * @param {Number} statValue - value of said stat
   * @param {String} skillName - name for the skill to be considered
   * @param {Number} skillValue - value of said skill
   * @param {String} roleName - name of the role if applicable
   * @param {Number} roleValue - value of said role
   * @param {String} weaponType - type of the weapon which is embedded in links to damage rolls in the roll card
   * @param {Number} universalBonusAttack - high level bonus provided by some role abilities and items
   */
  constructor(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack) {
    LOGGER.trace("constructor | CPRAimedAttackRoll | Called.");
    super(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
    this.rollTitle = `${weaponName}`;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-aimed-attack-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-aimed-attack-rollcard.hbs";
    this.addMod(-8);
    this.location = "head";
  }
}

/**
 * Like an attack roll, but with a specialized title and roll card.
 */
export class CPRAutofireRoll extends CPRAttackRoll {
  /**
   * @constructor
   * @param {String} attackName - a name for the attack. Used in the roll card (chat message)
   * @param {String} statName - name for the stat
   * @param {Number} statValue - value of said stat
   * @param {String} skillName - name for the skill to be considered
   * @param {Number} skillValue - value of said skill
   * @param {String} roleName - name of the role if applicable
   * @param {Number} roleValue - value of said role
   * @param {String} weaponType - type of the weapon which is embedded in links to damage rolls in the roll card
   * @param {Number} universalBonusAttack - high level bonus provided by some role abilities and items
   */
  constructor(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack) {
    LOGGER.trace("constructor | CPRAutofireRoll | Called.");
    super(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
    this.rollTitle = `${weaponName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-autofire-rollcard.hbs";
  }
}

/**
 * See CPRAutoFireRoll, this is the same idea.
 */
export class CPRSuppressiveFireRoll extends CPRAttackRoll {
  /**
   * @constructor
   * @param {String} attackName - a name for the attack. Used in the roll card (chat message)
   * @param {String} statName - name for the stat
   * @param {Number} statValue - value of said stat
   * @param {String} skillName - name for the skill to be considered
   * @param {Number} skillValue - value of said skill
   * @param {String} roleName - name of the role if applicable
   * @param {Number} roleValue - value of said role
   * @param {String} weaponType - type of the weapon which is embedded in links to damage rolls in the roll card
   * @param {Number} universalBonusAttack - high level bonus provided by some role abilities and items
   */
  constructor(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack) {
    LOGGER.trace("constructor | CPRSuppressiveFireRoll | Called.");
    super(weaponName, statName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
    this.rollTitle = `${weaponName}`;
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-suppressive-fire-rollcard.hbs";
  }
}

/**
 * RoleRolls are rolls for role abilities. I hope this is easier to say in other languages.
 * TODO: we can probably remove this once roles are items
 */
export class CPRRoleRoll extends CPRRoll {
  /**
   * @constructor
   * @param {String} roleName - role ability name
   * @param {Number} roleValue - role value
   * @param {String} skillName - skill name used in the roll
   * @param {Number} skillValue - skill value
   * @param {String} statName - stat name used in the roll
   * @param {Number} statValue - stat value
   * @param {Array} skillList
   */
  constructor(roleName, roleValue, skillName, skillValue, statName, statValue, skillList) {
    LOGGER.trace("constructor | CPRRoleRoll | Called.");
    super(roleName, "1d10");
    this.skillList = skillList;
    this.roleName = roleName;
    this.roleValue = roleValue;
    this.skillName = skillName;
    this.skillValue = skillValue;
    this.statName = statName;
    this.statValue = statValue;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-roleAbility-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-role-rollcard.hbs";
  }

  /**
   * Override this to include the role, skill, and stat values in the computation
   *
   * @override
   * @returns {Number}
   */
  _computeBase() {
    LOGGER.trace("_computeBase | CPRRoleRoll | Called.");
    return this.initialRoll + this.totalMods() + this.roleValue + this.skillValue + this.statValue;
  }

  /**
   * Flip this roll to stat role from a program, which has a special name, prompt, and card design.
   *
   * @param {String} rollTitle - a title for the roll, shown in the roll card (chat message)
   */
  setNetCombat(rollTitle) {
    LOGGER.trace("setNetCombat | CPRRoleRoll | Called.");
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-cyberdeck-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-cyberdeck-rollcard.hbs";
  }
}

/**
 * The infamous death save. It is just like a generic d10 roll, but we built in how to calculate ongoing
 * penalties from previous (successful) saves and critical injuries.
 */
export class CPRDeathSaveRoll extends CPRRoll {
  /**
   * @constructor
   * @param {Number} penalty - the ever-increasing penalty when death saves are made
   * @param {Number} basePenalty - a separate penalty from critical injuries
   * @param {Number} bodyStat - the value of the actor's body stat, used in the roll card
   */
  constructor(penalty, basePenalty, bodyStat) {
    LOGGER.trace("constructor | CPRDeathSaveRoll | Called.");
    super(SystemUtils.Localize("CPR.rolls.deathSave.title"), "1d10");
    this.calculateCritical = false;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-deathsave-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-deathsave-rollcard.hbs";
    this.penalty = penalty;
    this.basePenalty = basePenalty;
    this.bodyStat = bodyStat;
    // the result of the save, with "Success" or "Failure"
    this.saveResult = null;
  }

  /**
   * Override to automatically stack up the penalties as modifiers
   * @override
   * @returns {Number}
   */
  totalMods() {
    LOGGER.trace("totalMods | CPRDeathSaveRoll | Called.");
    return this.penalty + this.basePenalty;
  }
}

/**
 * Damage rolls are very different. d6s are used, and critical events are determined differently. Many other
 * things affect damage too, such as aimed shots or autofire.
 */
export class CPRDamageRoll extends CPRRoll {
  /**
   * @constructor
   * @param {String} rollTitle - a name for the roll, used in the roll card (chat message)
   * @param {String} formula - of the form Xd6[+Y]
   * @param {String} weaponType - the weapon type is considered when displaying alt fire modes in the UI
   * @param {Number} universalBonusDamage - a high level mod bestowed by some role abilities and items
   */
  constructor(rollTitle, formula, weaponType, universalBonusDamage) {
    LOGGER.trace("constructor | CPRDamageRoll | Called.");
    // we assume always d6s
    super(rollTitle, formula);
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-roll-damage-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-damage-rollcard.hbs";
    // criticals just add 5 damage, they do not need more dice rolled
    this.calculateCritical = false;
    this.universalBonusDamage = universalBonusDamage;
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

  /**
   * The base damage might be subject to multipliers and universal bonus damage, so we handle that here.
   *
   * @returns {Number}
   */
  _computeBase() {
    LOGGER.trace("_computeBase | CPRDamageRoll | Called.");
    this.autofireMultiplier = Math.min(this.autofireMultiplier, this.autofireMultiplierMax);
    const damageMultiplier = (this.isAutofire) ? this.autofireMultiplier : 1;
    if (this.universalBonusDamage) {
      return ((this.initialRoll + this.totalMods()) * damageMultiplier) + this.universalBonusDamage;
    }
    return ((this.initialRoll + this.totalMods()) * damageMultiplier);
  }

  /**
   * Damage rolls cannot critically fail, so we override this to always return false.
   *
   * @override
   * @returns {false}
   */
  // eslint-disable-next-line class-methods-use-this
  wasCritFail() {
    LOGGER.trace("wasCritFail | CPRDamageRoll | Called.");
    return false;
  }

  /**
   * 2 or more 6s on a damage roll is a critical success, which is different than the usual d10 rolls.
   * So we override this method to handle that.
   *
   * @override
   * @returns {Boolean}
   */
  wasCritSuccess() {
    LOGGER.trace("wasCritSuccess | CPRDamageRoll | Called.");
    return this.faces.filter((x) => x === 6).length >= 2;
  }

  /**
   * Unlike d10 based rolls in this system, critical events do not trigger another dice roll.
   * So this override is fairly simple: just call _computeBase().
   *
   * @override
   * @private
   */
  _computeResult() {
    LOGGER.trace("_computeResult | CPRDamageRoll | Called.");
    // figure how aimed shots work...
    this.resultTotal = this._computeBase();
  }

  /**
   * Convenience method for turning a damage into a roll for autofire damage which has a set
   * formula and no extra mods.
   */
  setAutofire() {
    LOGGER.trace("setAutofire | CPRDamageRoll | Called.");
    this.isAutofire = true;
    this.formula = "2d6";
    this.mods = [];
  }

  /**
   * Set up the autofire multiplier. This needs to happen before roll() is called.
   *
   * @param {Number} autofireMultiplier - damage multiplier that comes from how well the attack roll exceed the DV
   * @param {Number} autofireMultiplierMax - the maximum damage multiplier for the roll, which is set by the weapon type
   */
  configureAutofire(autofireMultiplier, autofireMultiplierMax = 0) {
    LOGGER.trace("configureAutofire | CPRDamageRoll | Called.");
    this.autofireMultiplier = autofireMultiplier;
    if (autofireMultiplierMax > this.autofireMultiplierMax) {
      this.autofireMultiplierMax = autofireMultiplierMax;
    }
  }

  /**
   * Flip this roll to stat role from a program, which has a special name, prompt, and card design.
   *
   * @param {String} rollTitle - a title for the roll, shown in the roll card (chat message)
   */
  setNetCombat(rollTitle) {
    LOGGER.trace("setNetCombat | CPRDamageRoll | Called.");
    this.rollTitle = rollTitle;
    this.rollPrompt = "systems/cyberpunk-red-core/templates/dialog/rolls/cpr-verify-program-damage-prompt.hbs";
    this.rollCard = "systems/cyberpunk-red-core/templates/chat/cpr-program-damage-rollcard.hbs";
  }
}

/**
 * CPRTableRoll is a wrapper object to handle "rolling" on a rollable table. This is used for critical injuries
 * right now.
 */
export class CPRTableRoll extends CPRRoll {
  /**
   * @constructor
   * @param {String} rollTitle - a title for the roll, used in the roll card (chat message)
   * @param {RollTable} tableRoll - object representing a rollable table
   * @param {String} rollCard - path to a roll card template
   */
  constructor(rollTitle, tableRoll, rollCard) {
    LOGGER.trace("constructor | CPRTableRoll | Called.");
    // This is just to create a CPR Roll Object from an already rolled RollTable
    const formula = tableRoll._formula;
    super(rollTitle, formula);
    this.rollCard = rollCard;
    (tableRoll.terms[0].results).forEach((die) => {
      this.faces.push(die.result);
    });
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
