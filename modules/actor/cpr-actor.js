/* globals Actor, game, getProperty, setProperty, hasProperty, randomID */
import LOGGER from "../utils/cpr-logger.js";
import CPRRolls from "../rolls/cpr-rolls.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import InstallCyberwarePrompt from "../dialog/cpr-cyberware-install-prompt.js";
import ConfirmPrompt from "../dialog/cpr-confirmation-prompt.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRActor extends Actor {
  /** @override */
  prepareData() {
    LOGGER.trace("prepareData | CPRActor | Called.");
    super.prepareData();

    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;

    // Prepare data for both types
    this._calculateDerivedStats(actorData);
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
    if (typeof data.data === "undefined") {
      LOGGER.trace("create | New Actor | CPRActor | called.");
      data.items = [];
      data.items = data.items.concat(await SystemUtils.GetCoreSkills(), await SystemUtils.GetCoreCyberware());
    }
    super.create(data, options);
  }

  async createEmbeddedEntity(embeddedName, itemData, options = {}) {
    LOGGER.trace("createEmbeddedEntity | CPRActor | called.");
    if (embeddedName === "OwnedItem") {
      if (itemData.data.core) {
        return Rules.lawyer(false, "CPR.dontaddcoreitems");
      }
    }
    // Standard embedded entity creation
    return super.createEmbeddedEntity(embeddedName, itemData, options);
  }

  _calculateDerivedStats(actorData) {
    // Calculate MAX HP
    LOGGER.trace("_calculateDerivedStats | CPRActor | Called.");

    const { stats } = actorData.data;
    const { derivedStats } = actorData.data;
    const setting = game.settings.get("cyberpunk-red-core", "calculateDerivedStats");

    // After the initial config of the game, a GM may want to disable the auto-calculation
    // of stats for Mooks & Players for custom homebrew rules

    if (setting) {
      const changedData = {};
      // Set max HP
      derivedStats.hp.max = 10 + 5 * Math.ceil((stats.will.value + stats.body.value) / 2);

      derivedStats.hp.value = Math.min(
        derivedStats.hp.value,
        derivedStats.hp.max,
      );
      changedData["data.hp.value"] = derivedStats.hp.value;
      // if (derivedStats.hp.value > derivedStats.hp.max) { derivedStats.hp.value = derivedStats.hp.max; };

      const { humanity } = actorData.data;
      // Max Humanity
      // TODO-- Subtract installed cyberware...
      let cyberwarePenalty = 0;
      this.getInstalledCyberware().forEach((cyberware) => {
        if (cyberware.getData().type === "borgware") {
          cyberwarePenalty += 4;
        } else if (parseInt(cyberware.getData().humanityLoss.static, 10) > 0) {
          cyberwarePenalty += 2;
        }
      });
      humanity.max = 10 * stats.emp.max - cyberwarePenalty; // minus sum of installed cyberware
      changedData["data.humanity.max"] = humanity.max;
      if (humanity.value > humanity.max) {
        humanity.value = humanity.max;
        changedData["data.humanity.value"] = humanity.value;
      }
      // Setting EMP to value based on current humannity.
      stats.emp.value = Math.floor(humanity.value / 10);

      this.update(changedData);
    }

    // Seriously wounded
    // Do we really need to store this or can we just calculate it dynamically as needed???
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    if (derivedStats.hp.value < derivedStats.hp.max) {
      this._setWoundState();
    }
    // Death save
    let basePenalty = 0;
    const { criticalInjuries } = this.data.data;
    criticalInjuries.forEach((injury) => {
      const { mods } = injury;
      const hasPenalty = (mods.filter((mod) => mod.name === "deathSavePenalty"))[0].value;
      if (hasPenalty) {
        basePenalty += 1;
      }
    });
    derivedStats.deathSave.basePenalty = basePenalty;
    derivedStats.deathSave.value = derivedStats.deathSave.penalty + derivedStats.deathSave.basePenalty;
  }

  // GET AND SET WOUND STATE
  getWoundState() {
    LOGGER.trace("getWoundState | CPRActor | Obtaining Wound State.");
    return this.data.data.woundState.currentWoundState;
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
    this.data.data.woundState.currentWoundState = newState;
  }

  getInstalledCyberware() {
    const installedCyberware = this.data.filteredItems.cyberware.filter((item) => item.getData().isInstalled);
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
    this.loseHumanityValue(formData);
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Applying foundational cyberware.");
    item.data.data.isInstalled = true;
    return this.updateEmbeddedEntity("OwnedItem", item.data);
  }

  async _addOptionalCyberware(item, formData) {
    LOGGER.trace("ActorID _addOptionalCyberware | CPRActorSheet | Called.");
    this.loseHumanityValue(formData);
    LOGGER.trace(`ActorID _addOptionalCyberware | CPRActorSheet | applying optional cyberware to item ${formData.foundationalId}.`);
    const foundationalCyberware = this._getOwnedItem(formData.foundationalId);
    foundationalCyberware.data.data.optionalIds.push(item.data._id);
    item.data.data.isInstalled = true;
    const usedSlots = foundationalCyberware.getData().optionalIds.length;
    const allowedSlots = Number(foundationalCyberware.getData().optionSlots);
    Rules.lawyer((usedSlots <= allowedSlots), "CPR.toomanyoptionalcyberwareinstalled");
    return this.updateEmbeddedEntity("OwnedItem", [item.data, foundationalCyberware.data]);
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
    foundationalCyberware.getData().optionalIds = foundationalCyberware.getData().optionalIds.filter((optionId) => optionId !== item.data._id);
    return this.updateEmbeddedEntity("OwnedItem", foundationalCyberware.data);
  }

  _removeFoundationalCyberware(item) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    const updateList = [];
    if (item.getData().optionalIds) {
      item.getData().optionalIds.forEach(async (optionalId) => {
        const optional = this._getOwnedItem(optionalId);
        optional.data.data.isInstalled = false;
        updateList.push(optional.data);
      });
      item.data.data.optionalIds = [];
      updateList.push(item.data);
      return this.updateEmbeddedEntity("OwnedItem", updateList);
    }
    return PromiseRejectionEvent();
  }

  async loseHumanityValue(amount) {
    if (amount.humanityLoss === "None") {
      return;
    }
    const { humanity } = this.data.data;
    let value = humanity.value ? humanity.value : humanity.max;
    if (amount.humanityLoss.match(/[0-9]+d[0-9]+/)) {
      value -= (await CPRRolls.CPRRoll(amount.humanityLoss)).total;
    } else {
      value -= parseInt(amount.humanityLoss, 10);
    }

    if (value <= 0) {
      Rules.lawyer(false, "CPR.youcyberpsycho");
    }

    this.update({ "data.humanity.value": value });
  }

  gainHumanityValue(amount) {
    const { humanity } = this.data.data;
    let { value } = humanity;
    const { max } = humanity;
    value += parseInt(amount.humanityLoss, 10);
    if (value > max) {
      value = max;
    }
    this.update({ "data.humanity.value": value });
  }

  sanityCheckCyberware() {
    const installedCyberware = this.getInstalledCyberware();
    const allCyberware = this.data.filteredItems.cyberware;
    let orphanedCyberware = allCyberware;

    const foundationalCyberware = allCyberware.filter((cyberware) => cyberware.getData().isFoundational === true);
    foundationalCyberware.forEach((fCyberware) => {
      fCyberware.data.data.optionalIds = [...new Set(fCyberware.data.data.optionalIds)];
      this.updateEmbeddedEntity("OwnedItem", fCyberware.data);
      orphanedCyberware = orphanedCyberware.filter((i) => i.data._id !== fCyberware.data._id);
      fCyberware.getData().optionalIds.forEach((oCyberwareId) => {
        const oCyberware = allCyberware.filter((o) => o.data._id === oCyberwareId)[0];
        oCyberware.data.data.isInstalled = true;
        this.updateEmbeddedEntity("OwnedItem", oCyberware.data);
        orphanedCyberware = orphanedCyberware.filter((i) => i.data._id !== oCyberwareId);
      });
    });
    orphanedCyberware.forEach((orphan) => {
      orphan.data.data.isInstalled = false;
      this.updateEmbeddedEntity("OwnedItem", orphan.data);
    });
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

  getSkillLevel(skillName) {
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return parseInt(relevantSkill.data.data.level, 10);
    }
    return 0;
  }

  processDeathSave(cprRoll) {
    let saveResult = cprRoll.resultTotal < this.data.data.stats.body.value ? "Success" : "Failed";
    if (cprRoll.initialRoll === 10) {
      saveResult = "Failed";
    }
    if (saveResult === "Success") {
      const deathPenalty = this.data.data.derivedStats.deathSave.penalty + 1;
      this.update({ "data.derivedStats.deathSave.penalty": deathPenalty });
    }
    return saveResult;
  }

  resetDeathPenalty() {
    this.update({ "data.derivedStats.deathSave.penalty": 0 });
  }

  getStat(statName) {
    return parseInt(this.stats[statName].value, 10);
  }

  clearLedger(prop) {
    LOGGER.trace("CPRActor clearLedger | called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = `${prop}.value`;
      const ledgerProp = `${prop}.transactions`;
      setProperty(this.data.data, valProp, 0);
      setProperty(this.data.data, ledgerProp, []);
      this.update(this.data);
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  deltaLedgerProperty(prop, value, reason) {
    LOGGER.trace("CPRActor setLedgerProperty | called.");
    if (this.isLedgerProperty(prop)) {
      // update "value"; it may be negative
      const valProp = `${prop}.value`;
      let newValue = getProperty(this.data.data, valProp);
      newValue += value;
      setProperty(this.data.data, valProp, newValue);
      // update the ledger with the change
      const ledgerProp = `${prop}.transactions`;
      const action = (value > 0) ? SystemUtils.Localize("CPR.increased") : SystemUtils.Localize("CPR.decreased");
      const ledger = getProperty(this.data.data, ledgerProp);
      ledger.push([`${prop} ${action} ${SystemUtils.Localize("CPR.to")} ${newValue}`, reason]);
      setProperty(this.data.data, ledgerProp, ledger);
      // update the actor and return the modified property
      this.update(this.data, {});
      return getProperty(this.data.data, prop);
    }
    return null;
  }

  setLedgerProperty(prop, value, reason) {
    LOGGER.trace("CPRActor setLedgerProperty | called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = `${prop}.value`;
      const ledgerProp = `${prop}.transactions`;
      setProperty(this.data.data, valProp, value);
      const ledger = getProperty(this.data.data, ledgerProp);
      ledger.push([`${prop} ${SystemUtils.Localize("CPR.setto")} ${value}`, reason]);
      setProperty(this.data.data, ledgerProp, ledger);
      this.update(this.data, {});
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

  addCriticalInjury(location, name, effect, quickfix, treatment, mods = []) {
    const id = randomID(10);
    const injuries = this.data.data.criticalInjuries;
    const injuryDetails = {
      id,
      location,
      name,
      effect,
      quickfix,
      treatment,
      mods,
    };
    injuries.push(injuryDetails);
    return this.update({ "data.criticalInjuries": injuries });
  }

  editCriticalInjury(injuryId, location, name, effect, quickfix, treatment, mods = []) {
    const { criticalInjuries } = this.data.data;
    const newInjuryList = [];
    criticalInjuries.forEach((injury) => {
      if (injury.id === injuryId) {
        injury.location = location;
        injury.name = name;
        injury.effect = effect;
        injury.quickfix = quickfix;
        injury.treatment = treatment;
        injury.mods = mods;
      }
      newInjuryList.push(injury);
    });
    return this.update({ "data.criticalInjuries": newInjuryList });
  }

  deleteCriticalInjury(injuryId) {
    const { criticalInjuries } = this.data.data;
    const filteredInjuries = criticalInjuries.filter((i) => i.id !== injuryId);
    return this.update({ "data.criticalInjuries": filteredInjuries });
  }

  getCriticalInjury(injuryId) {
    const { criticalInjuries } = this.data.data;
    const filteredInjuries = criticalInjuries.filter((i) => i.id === injuryId);
    if (filteredInjuries.length > 0) {
      return filteredInjuries[0];
    }
    return {};
  }
}
