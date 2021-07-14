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
 * @extends {Actor}
 */
export default class CPRActor extends Actor {
  /** @override */
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

  /** @override */
  getRollData() {
    LOGGER.trace("getRollData | CPRActor | Called.");
    const data = super.getRollData();
    return data;
  }

  getData() {
    LOGGER.trace("getData | CPRActor | Called.");
    return this.data.data;
  }

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
          return Rules.lawyer(false, "CPR.dontaddcoreitems");
        }
      }
    }
    // Standard embedded entity creation
    return super.createEmbeddedDocuments(embeddedName, data, context);
  }

  // eslint-disable-next-line class-methods-use-this
  _calculateDerivedStats() {
    LOGGER.trace("_calculateDerivedStats | CPRActor | Called.");
    throw new Error("This is an abstract method");
  }

  // GET AND SET WOUND STATE
  getWoundState() {
    LOGGER.trace("getWoundState | CPRActor | Obtaining Wound State.");
    return this.data.data.derivedStats.currentWoundState;
  }

  _setWoundState() {
    LOGGER.trace("setWoundState | CPRActor | Setting Wound State.");

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

  getInstalledCyberware() {
    LOGGER.trace("getInstalledCyberware | CPRActor | Called.");
    return this.data.filteredItems.cyberware.filter((item) => item.getData().isInstalled);
  }

  /**
   *
   * @param {string} type uses the type of a cyberware item to return a list of
   *                      compatiable foundational cyberware installed.
   */
  getInstalledFoundationalCyberware(type) {
    LOGGER.trace("getInstalledFoundationalCyberware | CPRActor | Called.");
    // TODO - Assert type is actually a fucking cyberware type... -__-
    if (type) {
      return this.data.filteredItems.cyberware.filter(
        (item) => item.getData().isInstalled
          && item.getData().isFoundational
          && item.getData().type === type,
      );
    }
    return this.data.filteredItems.cyberware.filter(
      (item) => item.getData().isInstalled && item.getData().isFoundational,
    );
  }

  async addCyberware(itemId) {
    LOGGER.trace("addCyberware | CPRActor | Called.");
    const item = this._getOwnedItem(itemId);
    const compatibleFoundationalCyberware = this.getInstalledFoundationalCyberware(item.getData().type);

    if (compatibleFoundationalCyberware.length < 1 && !item.getData().isFoundational) {
      Rules.lawyer(false, "CPR.warnnofoundationalcyberwareofcorrecttype");
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

  _addFoundationalCyberware(item, formData) {
    LOGGER.trace("_addFoundationalCyberware | CPRActor | Called.");
    this.loseHumanityValue(item, formData);
    LOGGER.debug("_addFoundationalCyberware | CPRActor | Applying foundational cyberware.");
    return this.updateEmbeddedDocuments("Item", [{ _id: item.id, "data.isInstalled": true }]);
  }

  async _addOptionalCyberware(item, formData) {
    LOGGER.trace("_addOptionalCyberware | CPRActor | Called.");
    const tmpItem = item;
    this.loseHumanityValue(item, formData);
    // eslint-disable-next-line max-len
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

  async removeCyberware(itemId, foundationalId, skipConfirm = false) {
    LOGGER.trace("removeCyberware | CPRActor | Called.");
    const item = this._getOwnedItem(itemId);
    let confirmRemove;
    if (!skipConfirm) {
      const dialogTitle = SystemUtils.Localize("CPR.removecyberwaredialogtitle");
      const dialogMessage = `${SystemUtils.Localize("CPR.removecyberwaredialogtext")} ${item.name}?`;
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
      Rules.lawyer(false, "CPR.youcyberpsycho");
    }

    this.update({ "data.derivedStats.humanity.value": value });
  }

  gainHumanityValue(amount) {
    LOGGER.trace("gainHumanityValue | CPRActor | Called.");
    const { humanity } = this.data.data;
    let { value } = humanity;
    const { max } = humanity;
    value += parseInt(amount.humanityLoss, 10);
    if (value > max) {
      value = max;
    }
    this.update({ "data.derivedStats.humanity.value": value });
  }

  _getOwnedItem(itemId) {
    LOGGER.trace("_getOwnedItem | CPRActor | Called.");
    return this.items.find((i) => i.data._id === itemId);
  }

  setRoles(formData) {
    LOGGER.trace("setRoles | CPRActor | Called.");
    const { activeRole } = formData;
    let roleList = formData.selectedRoles;
    roleList.push(activeRole);
    roleList = [...new Set(roleList)];
    return this.update({ "data.roleInfo.roles": roleList, "data.roleInfo.activeRole": activeRole });
  }

  setLifepath(formData) {
    LOGGER.trace("setLifepath | CPRActor | Called.");
    return this.update(formData);
  }

  getSkillLevel(skillName) {
    LOGGER.trace("getSkillLevel | CPRActor | Called.");
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.level, 10);
    }
    return 0;
  }

  getSkillMod(skillName) {
    LOGGER.trace("getSkillMod | CPRActor | Called.");
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.skillmod, 10);
    }
    return 0;
  }

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

  resetDeathPenalty() {
    LOGGER.trace("resetDeathPenalty | CPRActor | Called.");
    this.update({ "data.derivedStats.deathSave.penalty": 0 });
  }

  getStat(statName) {
    LOGGER.trace("getStat | CPRActor | Called.");
    return parseInt(this.data.data.stats[statName].value, 10);
  }

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
      const action = (value > 0) ? SystemUtils.Localize("CPR.increased") : SystemUtils.Localize("CPR.decreased");
      const ledger = getProperty(actorData, ledgerProp);
      ledger.push([`${prop} ${action} ${SystemUtils.Localize("CPR.to")} ${newValue}`, reason]);
      setProperty(actorData, ledgerProp, ledger);
      // update the actor and return the modified property
      this.update(actorData);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  setLedgerProperty(prop, value, reason) {
    LOGGER.trace("setLedgerProperty | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = `data.${prop}.value`;
      const ledgerProp = `data.${prop}.transactions`;
      const actorData = duplicate(this.data);
      setProperty(actorData, valProp, value);
      const ledger = getProperty(actorData, ledgerProp);
      ledger.push([`${prop} ${SystemUtils.Localize("CPR.setto")} ${value}`, reason]);
      setProperty(actorData, ledgerProp, ledger);
      this.update(actorData);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  listRecords(prop) {
    LOGGER.trace("listRecords | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      return getProperty(this.data.data, `${prop}.transactions`);
    }
    return null;
  }

  isLedgerProperty(prop) {
    /**
     * Return whether a property in actor data is a ledgerProperty. This means it has
     * two (sub-)properties, "value", and "transactions".
     */
    LOGGER.trace("isLedgerProperty | CPRActor | Called.");
    const ledgerData = getProperty(this.data.data, prop);
    if (!hasProperty(ledgerData, "value")) {
      SystemUtils.DisplayMessage("error", `Bug: Ledger property '${prop}' missing 'value'`);
      return false;
    }
    if (!hasProperty(ledgerData, "transactions")) {
      SystemUtils.DisplayMessage("error", `Bug: Ledger property '${prop}' missing 'transactions'`);
      return false;
    }
    return true;
  }

  showLedger(prop) {
    LOGGER.trace("showLedger | CPRActor | Called.");
    if (this.isLedgerProperty(prop)) {
      const led = new CPRLedger();
      led.setLedgerContent(prop, this.listRecords(prop));
      led.render(true);
    } else {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.ledgererrorisnoledger"));
    }
  }

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

  // Update actor data with data from the chosen armor so that it can be dislpayed in a resource bar.
  // eslint-disable-next-line consistent-return
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
  }

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

  static _getHands() {
    LOGGER.trace("_getHands | CPRActor | Called.");
    return 2;
  }

  _getFreeHands() {
    LOGGER.trace("_getFreeHands | CPRActor | Called.");
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map((w) => w.data.data.handsReq);
    const freeHands = CPRActor._getHands() - needed.reduce((a, b) => a + b, 0);
    return freeHands;
  }

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

  handleMookDraggedItem(item) {
    // called by the createOwnedItem listener (hook) when a user drags an item on a mook sheet
    // handles the automatic equipping of gear and installation of cyberware
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

  // Netrunning
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
