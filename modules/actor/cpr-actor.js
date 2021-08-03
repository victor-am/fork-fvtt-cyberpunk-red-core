/* globals Actor, game, getProperty, setProperty, hasProperty, duplicate */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPRChat from "../chat/cpr-chat.js";
import CPRLedger from "../dialog/cpr-ledger-form.js";
import CPR from "../system/config.js";
import ConfirmPrompt from "../dialog/cpr-confirmation-prompt.js";
import InstallCyberwarePrompt from "../dialog/cpr-cyberware-install-prompt.js";
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * CPRActor contains common code between mooks and characters (NPCs and players).
 * It extends Actor which comes from Foundry.
 *
 * @extends {Actor}
 */
export default class CPRActor extends Actor {
  /**
   * Called when an actor is passed to the client, we override this to calculate
   * derived stats and massage some of the data for convenience later.
   *
   * @override
   */
  prepareData() {
    LOGGER.trace("prepareData | CPRActor | Called.");
    super.prepareData();
    if (this.compendium === null || this.compendium === undefined) {
      // It looks like prepareData() is called for any actors/npc's that exist in
      // the game and the clients can't update them.  Everyone should only calculate
      // their own derived stats, or the GM should be able to calculate the derived
      // stat
      if (this.isOwner || game.user.isGM) {
        this._calculateDerivedStats();
      } else {
        const actorData = this.data;
        actorData.filteredItems = this.itemTypes;
      }
    }
  }

  /**
   * Does mostly nothing. We should probably get rid of this.
   * @return {Object} - a huge structured object representing actor data.
   */
  getData() {
    LOGGER.trace("getData | CPRActor | Called.");
    return this.data.data;
  }

  /**
   * The only reason we extend this code right now is to handle an edge case for migrations.
   *
   * @param {String} embeddedName - document name, usually a category like Item
   * @param {Object} data - Array of documents to consider
   * @param {Object} context - an object tracking the context in which the method is being called
   * @returns {null}
   */
  async createEmbeddedDocuments(embeddedName, data, context) {
    LOGGER.trace("createEmbeddedDocuments | CPRActor | called.");
    // If migration is calling this, we definitely want to
    // create the Embedded Documents.
    const isMigration = !!(((typeof context) !== "undefined" && context.CPRmigration));
    if (!isMigration) {
      if (embeddedName === "Item") {
        let containsCoreItem = false;
        data.forEach((document) => {
          if (document.data && document.data.core) {
            containsCoreItem = true;
          }
        });
        if (containsCoreItem) {
          Rules.lawyer(false, "CPR.messages.dontAddCoreItems");
          return null;
        }
      }
    }
    // Standard embedded entity creation
    return super.createEmbeddedDocuments(embeddedName, data, context);
  }

  /**
   * Characters and Mooks have ways to calculate derived stats, and they extend
   * this method to do so.
   *
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  _calculateDerivedStats() {
    LOGGER.trace("_calculateDerivedStats | CPRActor | Called.");
    throw new Error("This is an abstract method");
  }

  /**
   * Returns the current wound state of the actor
   *
   * @returns {String}
   */
  getWoundState() {
    LOGGER.trace("getWoundState | CPRActor | Obtaining Wound State.");
    return this.data.data.derivedStats.currentWoundState;
  }

  /**
   * Sets the wound state of the actor based on the current hit point value
   *
   * @private
   */
  _setWoundState() {
    LOGGER.trace("_setWoundState | CPRActor | Setting Wound State.");
    const { derivedStats } = this.data.data;
    let newState = "invalidState";
    if (derivedStats.hp.value < 1) {
      newState = "mortallyWounded";
    } else if (derivedStats.hp.value < derivedStats.seriouslyWounded) {
      newState = "seriouslyWounded";
    } else if (derivedStats.hp.value < derivedStats.hp.max) {
      newState = "lightlyWounded";
    } else if (derivedStats.hp.value === derivedStats.hp.max) {
      newState = "notWounded";
    }
    this.data.data.derivedStats.currentWoundState = newState;
  }

  /**
   * Looks up the wound state and returns the penalties (-2, -4) that should be applied to rolls
   *
   * @returns {Number}
   */
  getWoundStateMods() {
    LOGGER.trace("getWoundStateMods | CPRActor | Obtaining Wound State Mods.");
    let woundStateMod = 0;
    if (this.getWoundState() === "seriouslyWounded") {
      woundStateMod = -2;
    }
    if (this.getWoundState() === "mortallyWounded") {
      woundStateMod = -4;
    }
    return woundStateMod;
  }

  /**
   * Returns an array of installed cyberware items
   *
   * @returns {Array} - installed Cyberware Items
   */
  getInstalledCyberware() {
    LOGGER.trace("getInstalledCyberware | CPRActor | Called.");
    return this.data.filteredItems.cyberware.filter((item) => item.getData().isInstalled);
  }

  /**
   * Return an Array of cyberware matching the provided type and is installed.
   *
   * @param {string} type uses the type of a cyberware item to return a list of
   *                      compatiable foundational cyberware installed.
   * @return {Array} - Foundational Cyberware matching the type and is installed
   */
  getInstalledFoundationalCyberware(type) {
    LOGGER.trace("getInstalledFoundationalCyberware | CPRActor | Called.");
    if (type) {
      if (type in CPR.cyberwareTypeList) {
        return this.data.filteredItems.cyberware.filter(
          (item) => item.getData().isInstalled
            && item.getData().isFoundational
            && item.getData().type === type,
        );
      }
      SystemUtils.DisplayMessage("error", "Invalid cyberware type!");
    }
    return this.data.filteredItems.cyberware.filter(
      (item) => item.getData().isInstalled && item.getData().isFoundational,
    );
  }

  /**
   * Top-level method to add (install) cyberware owned by an actor.
   * This will handle making sure it is going into the right foundational cyberware, if applicable.
   *
   * @async
   * @param {String} itemId - the ItemId of the cyberware to be added
   * @returns {null}
   */
  async addCyberware(itemId) {
    LOGGER.trace("addCyberware | CPRActor | Called.");
    const item = this._getOwnedItem(itemId);
    const compatibleFoundationalCyberware = this.getInstalledFoundationalCyberware(item.getData().type);

    if (compatibleFoundationalCyberware.length < 1 && !item.getData().isFoundational) {
      Rules.lawyer(false, "CPR.messages.warnNoFoundationalCyberwareOfCorrectType");
    } else if (item.getData().isFoundational) {
      const formData = await InstallCyberwarePrompt.RenderPrompt({ item: item.data }).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }
      this._addFoundationalCyberware(item, formData);
    } else {
      const formData = await InstallCyberwarePrompt.RenderPrompt({
        item: item.data,
        foundationalCyberware: compatibleFoundationalCyberware,
      }).catch((err) => LOGGER.debug(err));
      if (formData === undefined) {
        return;
      }
      this._addOptionalCyberware(item, formData);
    }
  }

  /**
   * Add (install) foundational cyberware, which includes losing Humanity.
   *
   * @private
   * @param {CPRItem} item - the Cyberware item to install
   * @param {Object} formData - an object representing answers from the installation dialog box
   * @returns {Object}
   */
  _addFoundationalCyberware(item, formData) {
    LOGGER.trace("_addFoundationalCyberware | CPRActor | Called.");
    this.loseHumanityValue(item, formData);
    LOGGER.debug("_addFoundationalCyberware | CPRActor | Applying foundational cyberware.");
    return this.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.isInstalled": true }]);
  }

  /**
   * Add (install) optional cyberware, including the loss of Humanity
   *
   * @private
   * @param {CPRItem} item - the Cyberware item to install
   * @param {Object} formData - an object representing answers from the installation dialog box
   * @returns {Object}
   */
  async _addOptionalCyberware(item, formData) {
    LOGGER.trace("_addOptionalCyberware | CPRActor | Called.");
    const tmpItem = item;
    this.loseHumanityValue(item, formData);
    LOGGER.trace(`_addOptionalCyberware | CPRActor | applying optional cyberware to item ${formData.foundationalId}.`);
    const foundationalCyberware = this._getOwnedItem(formData.foundationalId);
    const newOptionalIds = foundationalCyberware.data.data.optionalIds.concat(item.data._id);
    const newInstalledOptionSlots = foundationalCyberware.data.data.installedOptionSlots + item.data.data.slotSize;
    tmpItem.data.data.isInstalled = true;
    const allowedSlots = Number(foundationalCyberware.availableSlots());
    Rules.lawyer((item.data.data.slotSize <= allowedSlots), "CPR.messages.tooManyOptionalCyberwareInstalled");
    return this.updateEmbeddedDocuments("Item", [
      { _id: item.id, "data.isInstalled": true }, {
        _id: foundationalCyberware.id,
        "data.optionalIds": newOptionalIds,
        "data.installedOptionSlots": newInstalledOptionSlots,
      },
    ]);
  }

  /**
   * Remove (uninstall) Cyberware from an actor. Like addCyberware, this is the top-level entry method.
   *
   * @async
   * @param {String} itemId - the Cyberware item ID to uninstall
   * @param {String} foundationalId - the foundational Cyberware Id to uninstall from
   * @param {Boolean} skipConfirm - a boolean to indicate whether the confirmation dialog should be displayed
   * @returns {Object}
   */
  async removeCyberware(itemId, foundationalId, skipConfirm = false) {
    LOGGER.trace("removeCyberware | CPRActor | Called.");
    const item = this._getOwnedItem(itemId);
    let confirmRemove;
    if (!skipConfirm) {
      const dialogTitle = SystemUtils.Localize("CPR.dialog.removeCyberware.title");
      const dialogMessage = `${SystemUtils.Localize("CPR.dialog.removeCyberware.text")} ${item.name}?`;
      confirmRemove = await ConfirmPrompt.RenderPrompt(dialogTitle, dialogMessage);
    } else {
      confirmRemove = true;
    }
    if (confirmRemove) {
      if (item.getData().isFoundational) {
        await this._removeFoundationalCyberware(item);
      } else {
        await this._removeOptionalCyberware(item, foundationalId);
      }
      return this.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.isInstalled": false }]);
    }
    return this.updateEmbeddedDocuments("Item", []);
  }

  /**
   * Remove (uninstall) optional cyberware
   *
   * @private
   * @param {CPRItem} item - optional cyberware item to uninstall
   * @param {String} foundationalId - The foundational cybeware Id to uninstall the cybeware from
   * @returns {Object}
   */
  _removeOptionalCyberware(item, foundationalId) {
    LOGGER.trace("_removeOptionalCyberware | CPRActor | Called.");
    const foundationalCyberware = this._getOwnedItem(foundationalId);
    const newInstalledOptionSlots = foundationalCyberware.data.data.installedOptionSlots - item.data.data.slotSize;
    const newOptionalIds = foundationalCyberware.getData().optionalIds.filter(
      (optionId) => optionId !== item.data._id,
    );
    return this.updateEmbeddedDocuments("Item", [{
      _id: foundationalCyberware.id,
      "data.optionalIds": newOptionalIds,
      "data.installedOptionSlots": newInstalledOptionSlots,
    }]);
  }

  /**
   * Remove (uninstall) foundational cyberware
   *
   * @private
   * @param {CPRItem} item - foundational cyberware item to uninstall
   * @returns {Object}
   */
  _removeFoundationalCyberware(item) {
    LOGGER.trace("_removeFoundationalCyberware | CPRActor | Called.");
    const updateList = [];
    if (item.getData().optionalIds) {
      item.getData().optionalIds.forEach(async (optionalId) => {
        const optional = this._getOwnedItem(optionalId);
        updateList.push({ _id: optional.id, "data.isInstalled": false });
      });
      updateList.push({ _id: item.id, "data.optionalIds": [], "data.installedOptionSlots": 0 });
      return this.updateEmbeddedDocuments("Item", updateList);
    }
    return PromiseRejectionEvent();
  }

  /**
   * Called when cyberware is installed, this method decreases Humanity on an actor, rolling
   * for the value if need be.
   *
   * @param {CPRItem} item - the Cyberware item being installed (provided just to name the roll)
   * @param {String} amount - how much to decrease humanity by. Will roll dice if it is a formula.
   * @returns {null}
   */
  async loseHumanityValue(item, amount) {
    LOGGER.trace("loseHumanityValue | CPRActor | Called.");
    if (amount.humanityLoss === "None") {
      LOGGER.trace("CPR Actor loseHumanityValue | Called. | humanityLoss was None.");
      return;
    }
    const { humanity } = this.data.data.derivedStats;
    let value = Number.isInteger(humanity.value) ? humanity.value : humanity.max;
    if (amount.humanityLoss.match(/[0-9]+d[0-9]+/)) {
      const humRoll = new CPRRolls.CPRHumanityLossRoll(item.data.name, amount.humanityLoss);
      await humRoll.roll();
      value -= humRoll.resultTotal;
      humRoll.entityData = { actor: this.id };
      CPRChat.RenderRollCard(humRoll);
      LOGGER.trace("CPR Actor loseHumanityValue | Called. | humanityLoss was rolled.");
    } else {
      value -= parseInt(amount.humanityLoss, 10);
      LOGGER.trace("CPR Actor loseHumanityValue | Called. | humanityLoss was static.");
    }

    if (value <= 0) {
      Rules.lawyer(false, "CPR.messages.youCyberpsycho");
    }

    this.update({ "data.derivedStats.humanity.value": value });
  }

  /**
   * Return the Item object given an Id
   *
   * @private
   * @param {String} itemId - Id of the item to get
   * @returns {CPRItem}
   */
  _getOwnedItem(itemId) {
    LOGGER.trace("_getOwnedItem | CPRActor | Called.");
    return this.items.find((i) => i.data._id === itemId);
  }

  /**
   * Called when the user accepts the dialog box defining roles and which one is "active." The data
   * is persisted to the actor object here.
   *
   * @param {Object} formData - an object of answers provided by the user in a form
   * @returns {Object}
   */
  setRoles(formData) {
    LOGGER.trace("setRoles | CPRActor | Called.");
    const { activeRole } = formData;
    let roleList = formData.selectedRoles;
    roleList.push(activeRole);
    roleList = [...new Set(roleList)];
    return this.update({ "data.roleInfo.roles": roleList, "data.roleInfo.activeRole": activeRole });
  }

  /**
   * Persist life path information to the actor model
   *
   * @param {Object} formData  - an object of answers provided by the user in a form
   * @returns {Object}
   */
  setLifepath(formData) {
    LOGGER.trace("setLifepath | CPRActor | Called.");
    return this.update(formData);
  }

  /**
   * Return the skill level (number) for a given skill on the actor.
   *
   * @param {String} skillName - the skill name (e.g. from CPR.skillList) to look up
   * @returns {Number} - skill level or 0 if not found
   */
  getSkillLevel(skillName) {
    LOGGER.trace("getSkillLevel | CPRActor | Called.");
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.level, 10);
    }
    return 0;
  }

  /**
   * Return the skill mod (number) for a given skill on the actor.
   *
   * @param {String} skillName - the skill name (e.g. from CPR.skillList) to look up
   * @returns {Number} - skill mod or 0 if not found
   */
  getSkillMod(skillName) {
    LOGGER.trace("getSkillMod | CPRActor | Called.");
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.skillmod, 10);
    }
    return 0;
  }

  /**
   * After a death save is rolled, process the results: assess pass/fail, and persist data to the actor
   * model. Remember when a save is passed, the next one gets harder.
   *
   * @param {CPRRoll} cprRoll - the rolled death save object
   * @returns {String}
   */
  processDeathSave(cprRoll) {
    LOGGER.trace("processDeathSave | CPRActor | Called.");
    const success = SystemUtils.Localize("CPR.rolls.success");
    const failed = SystemUtils.Localize("CPR.rolls.failed");
    let saveResult = cprRoll.resultTotal < this.data.data.stats.body.value ? success : failed;
    if (cprRoll.initialRoll === 10) {
      saveResult = failed;
    }
    if (saveResult === success) {
      const deathPenalty = this.data.data.derivedStats.deathSave.penalty + 1;
      this.update({ "data.derivedStats.deathSave.penalty": deathPenalty });
    }
    return saveResult;
  }

  /**
   * Whenever a death save passes, the penalty increases by 1. Once a character is stable,
   * the penalty should be reset to 0, which is what this method does.
   */
  resetDeathPenalty() {
    LOGGER.trace("resetDeathPenalty | CPRActor | Called.");
    this.update({ "data.derivedStats.deathSave.penalty": 0 });
  }

  /**
   * Given a stat name, return the value of it off the actor
   *
   * @param {String} statName - name (from CPR.statList) of the stat to retrieve
   * @returns {Number}
   */
  getStat(statName) {
    LOGGER.trace("getStat | CPRActor | Called.");
    return parseInt(this.data.data.stats[statName].value, 10);
  }

  /**
   * Get all mods provided by equippable and upgradeable items for a specific thing
   *
   * @param {String} baseName - name of the thing (e.g. stat) getting mods
   * @returns {Number}
   */
  getUpgradeMods(baseName) {
    LOGGER.trace("getUpgradeMods | CPRActor | Called.");
    let modValue = 0;
    // See if we have any items which upgrade our stat, and if so, upgrade the stat base
    const equippableItemTypes = SystemUtils.GetTemplateItemTypes("equippable");
    const upgradableItemTypes = SystemUtils.GetTemplateItemTypes("upgradable");
    const itemTypes = equippableItemTypes.filter((value) => upgradableItemTypes.includes(value));
    let modType = "modifier";

    itemTypes.forEach((itemType) => {
      const itemList = this.data.filteredItems[itemType].filter((i) => i.data.data.equipped === "equipped" && i.data.data.isUpgraded);
      itemList.forEach((i) => {
        const upgradeValue = i.getAllUpgradesFor(baseName);
        const upgradeType = i.getUpgradeTypeFor(baseName);
        if (modType === "override") {
          if (upgradeType === "override" && upgradeValue > modValue) {
            modValue = upgradeValue;
          }
        } else {
          modValue = (upgradeType === "override") ? upgradeValue : modValue + upgradeValue;
          modType = upgradeType;
        }
      });
    });

    return modValue;
  }

  /**
   * Given a property name on the actor model, wipe out all records in the corresponding ledger
   * for it. Effectively this sets it back to [].
   *
   * @param {String} prop - name of the property that has a ledger
   * @returns {Array} - empty or null if the property was not found
   */
  clearLedger(prop) {
    LOGGER.trace("clearLedger | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = `data.${prop}.value`;
      const ledgerProp = `data.${prop}.transactions`;
      const actorData = duplicate(this.data);
      setProperty(actorData, valProp, 0);
      setProperty(actorData, ledgerProp, []);
      this.update(actorData);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  /**
   * Change the value of a property and store a record of the change in the corresponding
   * ledger.
   *
   * @param {String} prop - name of the property that has a ledger
   * @param {Number} value - how much to increase or decrease the value by
   * @param {String} reason - a user-provided reason for the change
   * @returns {Number} (or null if not found)
   */
  deltaLedgerProperty(prop, value, reason) {
    LOGGER.trace("deltaLedgerProperty | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      // update "value"; it may be negative
      const valProp = `data.${prop}.value`;
      const actorData = duplicate(this.data);
      let newValue = getProperty(actorData, valProp);
      newValue += value;
      setProperty(actorData, valProp, newValue);
      // update the ledger with the change
      const ledgerProp = `data.${prop}.transactions`;
      const ledger = getProperty(actorData, ledgerProp);
      if (value > 0) {
        ledger.push([
          SystemUtils.Format("CPR.ledger.increaseSentence", { property: prop, amount: value, total: newValue }),
          reason]);
      } else {
        ledger.push([
          SystemUtils.Format("CPR.ledger.decreaseSentence", { property: prop, amount: (-1 * value), total: newValue }),
          reason]);
      }
      setProperty(actorData, ledgerProp, ledger);
      // update the actor and return the modified property
      this.update(actorData);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  /**
   * Set the value of a property and store a record of the change in the corresponding
   * ledger. This is different from applying a delta, here we just set the value.
   *
   * @param {String} prop - name of the property that has a ledger
   * @param {Number} value - what to set the value to
   * @param {String} reason - a user-provided reason for the change
   * @returns {Number} (or null if not found)
   */
  setLedgerProperty(prop, value, reason) {
    LOGGER.trace("setLedgerProperty | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = `data.${prop}.value`;
      const ledgerProp = `data.${prop}.transactions`;
      const actorData = duplicate(this.data);
      setProperty(actorData, valProp, value);
      const ledger = getProperty(actorData, ledgerProp);
      ledger.push([SystemUtils.Format("CPR.ledger.setSentence", { property: prop, total: value }), reason]);
      setProperty(actorData, ledgerProp, ledger);
      this.update(actorData);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  /**
   * Get all records from the associated ledger of a property.
   *
   * @param {String} prop - name of the property that has a ledger
   * @returns {Array} - Each element is a tuple: [value, reason], or null if not found
   */
  listRecords(prop) {
    LOGGER.trace("listRecords | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      return getProperty(this.data.data, `${prop}.transactions`);
    }
    return null;
  }

  /**
   * Return whether a property in actor data is a ledgerProperty. This means it has
   * two (sub-)properties, "value", and "transactions".
   *
   * @param {String} prop - name of the property that has a ledger
   * @returns {Boolean}
   */
  isLedgerProperty(prop) {
    LOGGER.trace("isLedgerProperty | CPRActor | Called.");
    const ledgerData = getProperty(this.data.data, prop);
    if (!hasProperty(ledgerData, "value")) {
      SystemUtils.DisplayMessage("error", SystemUtils.Format("CPR.ledger.errorMessage.missingValue", { prop }));
      return false;
    }
    if (!hasProperty(ledgerData, "transactions")) {
      SystemUtils.DisplayMessage("error", SystemUtils.Format("CPR.ledger.errorMessage.missingTransactions", { prop }));
      return false;
    }
    return true;
  }

  /**
   * Pop up a dialog box with ledger records for a given property.
   *
   * @param {String} prop - name of the property that has a ledger
   */
  showLedger(prop) {
    LOGGER.trace("showLedger | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      const led = new CPRLedger();
      led.setLedgerContent(prop, this.listRecords(prop));
      led.render(true);
    } else {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.ledgerErrorIsNoLedger"));
    }
  }

  /**
   * Given a stat, look up any armor penalties applied to it and return that number.
   *
   * @param {String} stat - name of a stat we are interested in seeing the mods on
   * @returns {Number}
   */
  getArmorPenaltyMods(stat) {
    LOGGER.trace("getArmorPenaltyMods | CPRActor | Called.");
    const penaltyStats = ["ref", "dex", "move"];
    const penaltyMods = [0];
    if (penaltyStats.includes(stat)) {
      const coverage = ["head", "body"];
      coverage.forEach((location) => {
        const penaltyValue = Number(this._getArmorValue("penalty", location));
        if (penaltyValue > 0) {
          penaltyMods.push(0 - penaltyValue);
        }
      });
    }
    return Math.min(...penaltyMods);
  }

  /**
   * Get the actors current armor value (or stat penalty) given a location.
   *
   * @private
   * @param {String} valueType - indicate whether to get the SP or stat penalty instead
   * @param {string} location - armor location to consider (head or body)
   * @returns {Number}
   */
  _getArmorValue(valueType, location) {
    LOGGER.trace("_getArmorValue | CPRActor | Called.");

    const armors = this.getEquippedArmors(location);
    let sps;
    let penalties;

    if (location === "body") {
      sps = armors.map((a) => a.data.data.bodyLocation.sp);
    } else if (location === "head") {
      sps = armors.map((a) => a.data.data.headLocation.sp);
    } // we assume getEquippedArmors will throw an error with a bad loc
    penalties = armors.map((a) => a.data.data.penalty);
    penalties = penalties.map(Math.abs);

    penalties.push(0);
    sps.push(0); // force a 0 if nothing is equipped

    if (valueType === "sp") {
      return Math.max(...sps); // Math.max treats null values in array as 0
    }
    if (valueType === "penalty") {
      return Math.max(...penalties); // Math.max treats null values in array as 0
    }
    return 0;
  }

  /**
   * Return an array of all equipped armors given a location. Yes, it is possible and within the rules
   * to wear multiple armors, even thought it might not be a good idea.
   *
   * @param {String} location - head, body, or shield
   * @returns {Array}
   */
  getEquippedArmors(location) {
    LOGGER.trace("getEquippedArmors | CPRActor | Called.");
    const armors = this.data.filteredItems.armor;
    const equipped = armors.filter((item) => item.getData().equipped === "equipped");

    if (location === "body") {
      return equipped.filter((item) => item.getData().isBodyLocation);
    }
    if (location === "head") {
      return equipped.filter((item) => item.getData().isHeadLocation);
    }
    if (location === "shield") {
      return equipped.filter((item) => item.getData().isShield);
    }
    throw new Error(`Bad location given: ${location}`);
  }

  /**
   * Update actor data with data from the given armor so that it can be dislpayed in a resource bar.
   *
   * @param {String} location - head, body, or shield
   * @param {String} id - Id of armor item we want to make "current" and available as a resource bar
   */
  makeThisArmorCurrent(location, id) {
    LOGGER.trace("makeThisArmorCurrent | CPRActor | Called.");
    const currentArmor = this._getOwnedItem(id);
    if (location === "body") {
      const currentArmorValue = currentArmor.data.data.bodyLocation.sp - currentArmor.data.data.bodyLocation.ablation;
      const currentArmorMax = currentArmor.data.data.bodyLocation.sp;
      return this.update({
        "data.externalData.currentArmorBody.value": currentArmorValue,
        "data.externalData.currentArmorBody.max": currentArmorMax,
        "data.externalData.currentArmorBody.id": id,
      });
    }
    if (location === "head") {
      const currentArmorValue = currentArmor.data.data.headLocation.sp - currentArmor.data.data.headLocation.ablation;
      const currentArmorMax = currentArmor.data.data.headLocation.sp;
      return this.update({
        "data.externalData.currentArmorHead.value": currentArmorValue,
        "data.externalData.currentArmorHead.max": currentArmorMax,
        "data.externalData.currentArmorHead.id": id,
      });
    }
    if (location === "shield") {
      const currentArmorValue = currentArmor.data.data.shieldHitPoints.value;
      const currentArmorMax = currentArmor.data.data.shieldHitPoints.max;
      return this.update({
        "data.externalData.currentArmorShield.value": currentArmorValue,
        "data.externalData.currentArmorShield.max": currentArmorMax,
        "data.externalData.currentArmorShield.id": id,
      });
    }
    return null;
  }

  /**
   * Create the appropriate roll object given a type. The type comes from link attributes in handlebars templates.
   *
   * @param {String} type - the type of roll to create
   * @param {String} name - a name for the roll, which is displayed in the roll card
   * @returns {CPRRoll}
   */
  createRoll(type, name) {
    LOGGER.trace("createRoll | CPRActor | Called.");
    switch (type) {
      case CPRRolls.rollTypes.STAT: {
        return this._createStatRoll(name);
      }
      case CPRRolls.rollTypes.ROLEABILITY: {
        return this._createRoleRoll(name);
      }
      case CPRRolls.rollTypes.DEATHSAVE: {
        return this._createDeathSaveRoll();
      }
      default:
    }
    return undefined;
  }

  /**
   * Create a stat roll and return the object representing it
   *
   * @private
   * @param {string} statName - name of the stat to generate a roll for
   * @returns {CPRStatRoll}
   */
  _createStatRoll(statName) {
    LOGGER.trace("_createStatRoll | CPRActor | Called.");
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = this.getStat(statName);
    const cprRoll = new CPRRolls.CPRStatRoll(niceStatName, statValue);
    cprRoll.addMod(this.getArmorPenaltyMods(statName));
    cprRoll.addMod(this.getWoundStateMods());
    cprRoll.addMod(this.getUpgradeMods(statName));
    return cprRoll;
  }

  /**
   * Create a "role" roll and return the object representing it
   *
   * @private
   * @param {string} roleName - name of the role to generate a roll for
   * @returns {CPRRoleRoll}
   */
  _createRoleRoll(roleName) {
    LOGGER.trace("_createRoleRoll | CPRActor | Called.");
    const niceRoleName = SystemUtils.Localize(CPR.roleAbilityList[roleName]);
    const roleValue = this._getRoleValue(roleName);
    let statName = "tech";
    let roleStat = 0;
    let roleOther = 0;
    if (roleName === "surgery") {
      roleStat = this.getStat(statName);
      const cprRoll = new CPRRolls.CPRRoleRoll(roleName, niceRoleName, statName, roleValue, roleStat, roleOther);
      cprRoll.addMod(this.getWoundStateMods());
      return cprRoll;
    }
    if (roleName === "medtechCryo" || roleName === "medtechPharma") {
      roleStat = this.getStat(statName);
      roleOther = this._getRoleValue("medtechPharma");
      const cprRoll = new CPRRolls.CPRRoleRoll(roleName, niceRoleName, statName, roleValue, roleStat, roleOther);
      cprRoll.addMod(this.getWoundStateMods());
      return cprRoll;
    }
    if (roleName === "operator") {
      statName = "cool";
      roleStat = this.getStat(statName);
      roleOther = this.getSkillLevel("Trading") + this.getSkillMod("Trading");
      const cprRoll = new CPRRolls.CPRRoleRoll(roleName, niceRoleName, statName, roleValue, roleStat, roleOther);
      cprRoll.addMod(this.getWoundStateMods());
      return cprRoll;
    }
    const cprRoll = new CPRRolls.CPRRoleRoll(roleName, niceRoleName, statName, roleValue, roleStat, roleOther);
    cprRoll.addMod(this.getWoundStateMods());
    return cprRoll;
  }

  /**
   * Return the value of a role ability given its name
   *
   * @private
   * @param {String} roleName - name of the role we are interested in getting the value of
   * @returns {Number} or null if not found
   */
  _getRoleValue(roleName) {
    LOGGER.trace("_getRoleValue | CPRActor | Called.");
    const { roleskills: roles } = this.data.data.roleInfo;
    const abilities = Object.values(roles);
    for (const ability of abilities) {
      const keys = Object.keys(ability);
      for (const key of keys) {
        if (key === roleName) return ability[key];
        if (key === "subSkills") {
          const subSkills = Object.keys(ability[key]);
          for (const subSkill of subSkills) {
            if (subSkill === roleName) return ability.subSkills[subSkill];
          }
        }
      }
    }
    return null;
  }

  /**
   * Create a death save roll and return the object representing it
   *
   * @private
   * @returns {CPRDeathSaveRoll}
   */
  _createDeathSaveRoll() {
    LOGGER.trace("_createDeathSaveRoll | CPRActor | Called.");
    const deathSavePenalty = this.data.data.derivedStats.deathSave.penalty;
    const deathSaveBasePenalty = this.data.data.derivedStats.deathSave.basePenalty;
    const bodyStat = this.data.data.stats.body.value;
    return new CPRRolls.CPRDeathSaveRoll(deathSavePenalty, deathSaveBasePenalty, bodyStat);
  }

  // We need a way to unload a specific ammo from all of the weapons
  // in case the ammo item is deleted or given to someone else.
  unloadAmmoFromAllOwnedWeapons(ammoId) {
    LOGGER.trace("unloadAmmoFromAllOwnedWeapons | CPRActor | Called.");
    const weapons = this.data.filteredItems.weapon;
    weapons.forEach((weapon) => {
      const weaponData = weapon.data.data;
      if (weaponData.isRanged) {
        if (weaponData.magazine.ammoId === ammoId) {
          weapon._weaponUnload();
        }
      }
    });
  }

  // Determine if this actor has a specific item type equipped
  hasItemTypeEquipped(itemType) {
    LOGGER.trace("hasItemTypeEquipped | CPRActor | Called.");
    let equipped = false;
    if (this.data.filteredItems[itemType]) {
      this.data.filteredItems[itemType].forEach((i) => {
        if (i.data.data.equipped) {
          if (i.data.data.equipped === "equipped") {
            equipped = true;
          }
        }
      });
    }
    return equipped;
  }

  /**
   * Return the number of hands the actor has. For now this assumes 2, but in the future
   * it will need to consider some cyberware options that provide more hands.
   *
   * @static
   * @private
   * @returns {Number}
   */
  static _getHands() {
    LOGGER.trace("_getHands | CPRActor | Called.");
    return 2;
  }

  /**
   * Return the number of free hands an actor has, based on what is currently equipped (wielded)
   *
   * @private
   * @returns {Number}
   */
  _getFreeHands() {
    LOGGER.trace("_getFreeHands | CPRActor | Called.");
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map((w) => w.data.data.handsReq);
    const freeHands = CPRActor._getHands() - needed.reduce((a, b) => a + b, 0);
    return freeHands;
  }

  /**
   * Return an array of weapons that are currently equipped
   *
   * @private
   * @returns {Array} of CPRItems
   */
  _getEquippedWeapons() {
    LOGGER.trace("_getEquippedWeapons | CPRActor | Called.");
    const weapons = this.data.filteredItems.weapon;
    return weapons.filter((a) => a.getData().equipped === "equipped");
  }

  /**
   * Helper method to assess whether the actor can hold another weapon. Used to assess whether
   * an item can be equipped.
   *
   * @param {Item} weapon - item proposed to be held
   * @returns {Boolean}
   */
  canHoldWeapon(weapon) {
    LOGGER.trace("canHoldWeapon | CPRActor | Called.");
    const needed = weapon.data.data.handsReq;
    if (needed > this._getFreeHands()) {
      return false;
    }
    return true;
  }

  /**
   * Called by the createOwnedItem listener (hook) when a user drags an item on a mook sheet
   * It handles the automatic equipping of gear and installation of cyberware.
   *
   * @param {CPRItem} item - the item that was dragged
   */
  handleMookDraggedItem(item) {
    LOGGER.trace("handleMookDraggedItem | CPRActor | Called.");
    LOGGER.debug("auto-equipping or installing a dragged item to the mook sheet");
    LOGGER.debugObject(item);
    switch (item.data.type) {
      case "clothing":
      case "weapon":
      case "gear":
      case "armor": {
        // chose change done for 0.8.x, and not the fix from dev, as it seems to work without it.
        this.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.equipped": "equipped" }]);
        break;
      }
      case "cyberware": {
        this.addCyberware(item.id);
        break;
      }
      default:
    }
  }

  /**
   * Return the first equipped cyberdeck found.
   *
   * @returns {CPRItem} or null if none are found/equipped
   */
  getEquippedCyberdeck() {
    LOGGER.trace("getEquippedCyberdeck | CPRActor | Called.");
    const cyberdecks = this.data.filteredItems.cyberdeck;
    const equipped = cyberdecks.filter((item) => item.getData().equipped === "equipped");
    if (equipped) {
      return equipped[0];
    }
    return null;
  }

  /**
   * TODO:
   * This method was created to facilitate homebrew critical injuries with a macro.
   * It is not used anywhere else, and likely belongs in its own file to be exposed in
   * a sanctioned API. (_rollCriticalInjury() largely replaces this functionality.)
   *
   * @returns {Object}
   */
  addCriticalInjury(location, name, effect, quickFixType, quickFixDV, treatmentType, treatmentDV, deathSaveIncrease = false) {
    LOGGER.trace("addCriticalInjury | CPRActor | Called.");
    const itemData = {
      type: "criticalInjury",
      name,
      data: {
        location,
        description: {
          value: effect,
          chat: "",
          unidentified: "",
        },
        quickFix: {
          type: quickFixType,
          dv: quickFixDV,
        },
        treatment: {
          type: treatmentType,
          dv: treatmentDV,
        },
        deathSaveIncrease,
      },
    };
    return this.createEmbeddedEntity("Item", itemData, { force: true });
  }

  /**
   * automaticallyStackItems searches for an identical item on the actor
   * and if found increments the amount and price for the item on the actor
   * instead of adding it as a new item.
   *
   * @param {Object} newItem - an object containing the new item
   * @returns {boolean} - true if thee item should be added normally
   *                    - false if it has been stacked on an existing item
   */
  automaticallyStackItems(newItem) {
    LOGGER.trace("automaticallyStackItems | CPRActor | Called.");
    const stackableItemTypes = ["ammo", "gear", "clothing"];
    if (stackableItemTypes.includes(newItem.type)) {
      const match = this.items.find((i) => i.type === newItem.type && i.name === newItem.name && i.data.data.upgrades.length === 0);
      if (match) {
        let oldAmount = parseInt(match.data.data.amount, 10);
        let addedAmount = parseInt(newItem.data.data.amount, 10);
        if (Number.isNaN(oldAmount)) { oldAmount = 1; }
        if (Number.isNaN(addedAmount)) { addedAmount = 1; }
        const newAmount = oldAmount + addedAmount;
        this.updateEmbeddedDocuments("Item", [{ _id: match.id, "data.amount": newAmount }]);
        return false;
      }
    }
    // If not stackable, then return true to continue adding the item.
    return true;
  }
}
