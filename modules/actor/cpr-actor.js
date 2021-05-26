/* eslint-disable class-methods-use-this */
/* globals Actor, game, getProperty, setProperty, hasProperty, duplicate */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPRChat from "../chat/cpr-chat.js";
import CPR from "../system/config.js";
import ConfirmPrompt from "../dialog/cpr-confirmation-prompt.js";
import InstallCyberwarePrompt from "../dialog/cpr-cyberware-install-prompt.js";
import LOGGER from "../utils/cpr-logger.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Extend the base Actor entity. Foundry only supports 1 Actor class that gets associated with
 * different sheets. If we need need different classes, there are examples to work around this
 * design limitation:
 *   - Burning Wheel uses a proxy class to intiate the class they want
 *   - PF2 instaniates a custom class in the constructor
 * This may become relevant when we implement "container" actors, programs, and demons.
 * @extends {Actor}
 */
export default class CPRActor extends Actor {
  /** @override */
  prepareData() {
    LOGGER.trace("prepareData | CPRActor | Called.");
    super.prepareData();
    if (this.compendium === null) {
      // It looks like prepareData() is called for any actors/npc's that exist in
      // the game and the clients can't update them.  Everyone should only calculate
      // their own derived stats, or the GM should be able to calculate the derived
      // stat
      if (this.owner || game.user.isGM) {
        this._calculateDerivedStats();
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

  /** @override */
  static async create(data, options) {
    LOGGER.trace("create | CPRActor | called.");
    const createData = data;
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRActor | called.");
      createData.items = [];
      createData.items = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
      if (data.type === "character") {
        createData.token = {
          actorLink: true,
          disposition: 1,
          vision: true,
          bar1: { attribute: "derivedStats.hp" },
        };
      }
    }
    super.create(createData, options);
  }

  async createEmbeddedEntity(embeddedName, itemData, options = {}) {
    LOGGER.trace("createEmbeddedEntity | CPRActor | called.");
    if (!options.force) {
      if (embeddedName === "OwnedItem") {
        if (itemData.data.core) {
          return Rules.lawyer(false, "CPR.dontaddcoreitems");
        }
      }
    }
    // Standard embedded entity creation
    return super.createEmbeddedEntity(embeddedName, itemData, options);
  }

  _calculateDerivedStats() {
    // Calculate MAX HP
    LOGGER.trace("_calculateDerivedStats | CPRActor | Called.");
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;

    const { stats } = actorData.data;
    const { derivedStats } = actorData.data;
    const setting = game.settings.get("cyberpunk-red-core", "calculateDerivedStats");

    // After the initial config of the game, a GM may want to disable the auto-calculation
    // of stats for Mooks & Players for custom homebrew rules
    if (setting && actorData.type === "character") {
      // Set max HP
      derivedStats.hp.max = 10 + 5 * Math.ceil((stats.will.value + stats.body.value) / 2);

      derivedStats.hp.value = Math.min(
        derivedStats.hp.value,
        derivedStats.hp.max,
      );

      // Max Humanity
      let cyberwarePenalty = 0;
      this.getInstalledCyberware().forEach((cyberware) => {
        if (cyberware.getData().type === "borgware") {
          cyberwarePenalty += 4;
        } else if (parseInt(cyberware.getData().humanityLoss.static, 10) > 0) {
          cyberwarePenalty += 2;
        }
      });
      derivedStats.humanity.max = 10 * stats.emp.max - cyberwarePenalty; // minus sum of installed cyberware
      if (derivedStats.humanity.value > derivedStats.humanity.max) {
        derivedStats.humanity.value = derivedStats.humanity.max;
      }
      // Setting EMP to value based on current humannity.
      stats.emp.value = Math.floor(derivedStats.humanity.value / 10);
    }

    // Seriously wounded
    // Do we really need to store this or can we just calculate it dynamically as needed???
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    // We need to always call this because if the actor was wounded and now is not, their
    // value would be equal to max, however their current wound state was never updated.
    this._setWoundState();
    // Updated derivedStats variable with currentWoundState
    derivedStats.currentWoundState = this.data.data.derivedStats.currentWoundState;

    // Death save
    let basePenalty = 0;
    const critInjury = this.data.filteredItems.criticalInjury;
    critInjury.forEach((criticalInjury) => {
      const { deathSaveIncrease } = criticalInjury.data.data;
      if (deathSaveIncrease) {
        basePenalty += 1;
      }
    });
    // In 0.73.2 we moved all of the Death Save data into the single data point of
    // derivedStats.deathSave.basePenalty, however, it causes a chicken/egg situation
    // since it loads the data up before it migrates, triggering this code to run which
    // errors out and ultimately messing the migration up. Yay. We should be able to
    // remove this code after a release or two
    if ((typeof derivedStats.deathSave) === "number") {
      const oldPenalty = derivedStats.deathSave;
      derivedStats.deathSave = {
        value: 0,
        penalty: oldPenalty,
        basePenalty,
      };
    }
    derivedStats.deathSave.basePenalty = basePenalty;
    derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
    this.data.data.derivedStats = derivedStats;
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
    return this.data.filteredItems.cyberware.filter((item) => item.getData().isInstalled);
  }

  /**
   *
   * @param {string} type uses the type of a cyberware item to return a list of
   *                      compatiable foundational cyberware installed.
   */
  getInstalledFoundationalCyberware(type) {
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
    const item = this._getOwnedItem(itemId);
    const compatibleFoundationalCyberware = this.getInstalledFoundationalCyberware(item.getData().type);

    if (compatibleFoundationalCyberware.length < 1 && !item.getData().isFoundational) {
      Rules.lawyer(false, "CPR.warnnofoundationalcyberwareofcorrecttype");
    } else if (item.getData().isFoundational) {
      const formData = await InstallCyberwarePrompt.RenderPrompt({ item: item.data });
      return this._addFoundationalCyberware(item, formData);
    } else {
      const formData = await InstallCyberwarePrompt.RenderPrompt({
        item: item.data,
        foundationalCyberware: compatibleFoundationalCyberware,
      });
      return this._addOptionalCyberware(item, formData);
    }
    return PromiseRejectionEvent();
  }

  _addFoundationalCyberware(item, formData) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    const tmpItem = item;
    this.loseHumanityValue(tmpItem, formData);
    LOGGER.debug("ActorID _addFoundationalCyberware | CPRActorSheet | Applying foundational cyberware.");
    tmpItem.data.data.isInstalled = true;
    return this.updateEmbeddedEntity("OwnedItem", tmpItem.data);
  }

  async _addOptionalCyberware(item, formData) {
    LOGGER.trace("ActorID _addOptionalCyberware | CPRActorSheet | Called.");
    const tmpItem = item;
    this.loseHumanityValue(tmpItem, formData);
    // eslint-disable-next-line max-len
    LOGGER.trace(`ActorID _addOptionalCyberware | CPRActorSheet | applying optional cyberware to item ${formData.foundationalId}.`);
    const foundationalCyberware = this._getOwnedItem(formData.foundationalId);
    foundationalCyberware.data.data.optionalIds.push(tmpItem.data._id);
    foundationalCyberware.data.data.installedOptionSlots += tmpItem.data.data.slotSize;
    tmpItem.data.data.isInstalled = true;
    const usedSlots = foundationalCyberware.getData().installedOptionSlots;
    const allowedSlots = Number(foundationalCyberware.getData().optionSlots);
    Rules.lawyer((usedSlots <= allowedSlots), "CPR.toomanyoptionalcyberwareinstalled");
    return this.updateEmbeddedEntity("OwnedItem", [tmpItem.data, foundationalCyberware.data]);
  }

  async removeCyberware(itemId, foundationalId) {
    LOGGER.trace("ActorID _removeCyberware | CPRActorSheet | Called.");
    const item = this._getOwnedItem(itemId);
    const dialogTitle = SystemUtils.Localize("CPR.removecyberwaredialogtitle");
    const dialogMessage = `${SystemUtils.Localize("CPR.removecyberwaredialogtext")} ${item.name}?`;
    const confirmRemove = await ConfirmPrompt.RenderPrompt(dialogTitle, dialogMessage);
    if (confirmRemove) {
      if (item.getData().isFoundational) {
        await this._removeFoundationalCyberware(item);
      } else {
        await this._removeOptionalCyberware(item, foundationalId);
      }
      item.data.data.isInstalled = false;
    }
    return this.updateEmbeddedEntity("OwnedItem", item.data);
  }

  _removeOptionalCyberware(item, foundationalId) {
    LOGGER.trace("ActorID _removeOptionalCyberware | CPRActorSheet | Called.");
    const foundationalCyberware = this._getOwnedItem(foundationalId);
    foundationalCyberware.data.data.installedOptionSlots -= item.data.data.slotSize;
    foundationalCyberware.getData().optionalIds = foundationalCyberware.getData().optionalIds.filter(
      (optionId) => optionId !== item.data._id,
    );
    return this.updateEmbeddedEntity("OwnedItem", foundationalCyberware.data);
  }

  _removeFoundationalCyberware(item) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    const tmpItem = item;
    const updateList = [];
    if (tmpItem.getData().optionalIds) {
      tmpItem.getData().optionalIds.forEach(async (optionalId) => {
        const optional = this._getOwnedItem(optionalId);
        optional.data.data.isInstalled = false;
        updateList.push(optional.data);
      });
      tmpItem.data.data.optionalIds = [];
      updateList.push(tmpItem.data);
      return this.updateEmbeddedEntity("OwnedItem", updateList);
    }
    return PromiseRejectionEvent();
  }

  async loseHumanityValue(item, amount) {
    LOGGER.trace("CPR Actor loseHumanityValue | Called.");
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
      humRoll.entityData = { actor: this._id };
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
    return this.items.find((i) => i.data._id === itemId);
  }

  setRoles(formData) {
    const { activeRole } = formData;
    let roleList = formData.selectedRoles;
    roleList.push(activeRole);
    roleList = [...new Set(roleList)];
    return this.update({ "data.roleInfo.roles": roleList, "data.roleInfo.activeRole": activeRole });
  }

  setLifepath(formData) {
    return this.update(formData);
  }

  setMookName(formData) {
    return this.update(formData);
  }

  getSkillLevel(skillName) {
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.level, 10);
    }
    return 0;
  }

  getSkillMod(skillName) {
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.skillmod, 10);
    }
    return 0;
  }

  processDeathSave(cprRoll) {
    const success = SystemUtils.Localize("CPR.success");
    const failed = SystemUtils.Localize("CPR.failed");
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
    this.update({ "data.derivedStats.deathSave.penalty": 0 });
  }

  getStat(statName) {
    return parseInt(this.data.data.stats[statName].value, 10);
  }

  clearLedger(prop) {
    LOGGER.trace("CPRActor clearLedger | called.");
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
    LOGGER.trace("CPRActor setLedgerProperty | called.");
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
    LOGGER.trace("CPRActor setLedgerProperty | called.");
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
    LOGGER.trace("CPRActor _listRecords | called.");
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
    LOGGER.trace("CPRActor _checkProperty | called.");
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

  addCriticalInjury(location, name, effect, quickFixType, quickFixDV, treatmentType, treatmentDV, deathSaveIncrease = false) {
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
    return this.createEmbeddedEntity("OwnedItem", itemData, { force: true });
  }

  getArmorPenaltyMods(stat) {
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
    LOGGER.trace("ActorID _getArmorValue| CPRActorSheet | Called.");

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
    LOGGER.trace("ActorID _getEquippedArmors | CPRActorSheet | Called.");
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
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = this.getStat(statName);
    const cprRoll = new CPRRolls.CPRStatRoll(niceStatName, statValue);
    cprRoll.addMod(this.getArmorPenaltyMods(statName));
    cprRoll.addMod(this.getWoundStateMods());
    return cprRoll;
  }

  _createRoleRoll(roleName) {
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
    const deathSavePenalty = this.data.data.derivedStats.deathSave.penalty;
    const deathSaveBasePenalty = this.data.data.derivedStats.deathSave.basePenalty;
    const bodyStat = this.data.data.stats.body.value;
    return new CPRRolls.CPRDeathSaveRoll(deathSavePenalty, deathSaveBasePenalty, bodyStat);
  }

  // We need a way to unload a specific ammo from all of the weapons
  // in case the ammo item is deleted or given to someone else.
  unloadAmmoFromAllOwnedWeapons(ammoId) {
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

  handleMookDraggedItem(item) {
    // called by the createOwnedItem listener (hook) when a user drags an item on a mook sheet
    // handles the automatic equipping of gear and installation of cyberware
    LOGGER.trace("_handleMookDraggedItem | CPRActor | Called.");
    LOGGER.debug("auto-equipping or installing a dragged item to the mook sheet");
    LOGGER.debugObject(item);
    const newItem = item;
    switch (item.type) {
      case "clothing":
      case "weapon":
      case "gear":
      case "armor": {
        if (newItem.data.data) {
          newItem.data.data.equipped = "equipped";
          this.updateEmbeddedEntity("OwnedItem", newItem.data);
        } else {
          newItem.data.equipped = "equipped";
          this.updateEmbeddedEntity("OwnedItem", newItem);
        }
        break;
      }
      case "cyberware": {
        this.addCyberware(item._id);
        break;
      }
      default:
    }
  }
}
