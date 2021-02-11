/* eslint-disable no-undef */
/* eslint-disable radix */
/* globals Actor */
import LOGGER from "../utils/cpr-logger.js";
import CPRRolls from "../rolls/cpr-rolls.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

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

    // Prepare type data
    if (actorData.type === "character") this._prepareCharacterData(actorData);
    if (actorData.type === "mook") this._prepareMookData(actorData);
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
    if (itemData.data.core) {
      return Rules.lawyer(false, "CPR.dontaddcoreitems");
    }
    // Standard embedded entity creation
    return super.createEmbeddedEntity(embeddedName, itemData, options);
  }

  _prepareCharacterData(actorData) {
    LOGGER.trace("_prepareCharacterData | CPRActor | Called.");
    const { data } = actorData;
  }

  _prepareMookData(actorData) {
    LOGGER.trace("_prepareMookData | CPRActor | Called.");
    const { data } = actorData;
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
      // Set max HP
      derivedStats.hp.max = 10 + 5 * Math.ceil((stats.will.value + stats.body.value) / 2);

      derivedStats.hp.value = Math.min(
        derivedStats.hp.value,
        derivedStats.hp.max,
      );
      // if (derivedStats.hp.value > derivedStats.hp.max) { derivedStats.hp.value = derivedStats.hp.max; };

      const { humanity } = actorData.data;
      // Max Humanity
      // TODO-- Subtract installed cyberware...
      let cyberwarePenalty = 0;
      this.getInstalledCyberware().forEach((cyberware) => {
        if (cyberware.getData().type === "borgware") {
          cyberwarePenalty += 4;
        } else if (parseInt(cyberware.getData().humanityLoss.static) > 0) {
          cyberwarePenalty += 2;
        }
      });
      humanity.max = 10 * stats.emp.max - cyberwarePenalty; // minus sum of installed cyberware
      if (humanity.value > humanity.max) {
        humanity.value = humanity.max;
      }
      // Setting EMP to value based on current humannity.
      stats.emp.value = Math.floor(humanity.value / 10);
    }

    // Seriously wounded
    // Do we really need to store this or can we just calculate it dynamically as needed???
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    if (derivedStats.hp.value < derivedStats.hp.max) {
      this._setWoundState();
    }
    // Death save
    derivedStats.deathSave = stats.body.value;
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

  async loseHumanityValue(amount) {
    const { humanity } = this.data.data;
    let value = humanity.value ? humanity.value : humanity.max;
    if (amount.humanityLoss.match(/[0-9]+d[0-9]+/)) {
      value -= (await CPRRolls.CPRRoll(amount.humanityLoss)).total;
    } else {
      value -= parseInt(amount.humanityLoss);
    }

    if (value < 0) {
      value = 0;
    }
    this.update({ "data.humanity.value": value });
  }

  gainHumanityValue(amount) {
    const { humanity } = this.data.data;
    let { value } = humanity;
    const { max } = humanity;
    value += parseInt(amount.humanityLoss);
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
      orphanedCyberware = orphanedCyberware.filter((i) => i.data._id !== fCyberware.data._id);
      fCyberware.getData().optionalIds.forEach((oCyberwareId) => {
        orphanedCyberware = orphanedCyberware.filter((i) => i.data._id !== oCyberwareId);
      });
    });
    orphanedCyberware.forEach((orphan) => {
      orphan.data.data.isInstalled = false;
      this.updateEmbeddedEntity("OwnedItem", orphan.data);
    });
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id === itemId);
  }

  setRoles(roleList) {
    this.update({ "data.roleInfo.roles": roleList });
  }

  getSkillLevel(skillName) {
    const skillList = (this.data.filteredItems.skill).filter((s) => s.name === skillName);
    if (skillList.length > 0) {
      const relevantSkill = skillList[0];
      return relevantSkill.data.data.level;
    }
    return 0;
  }

  deltaLedgerProperty(prop, value, reason) {
    LOGGER.trace("CPRActor setLedgerProperty | called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = prop + ".value";
      const ledgerProp = prop + ".transactions";
      const action = (value > 0) ? "increased" : "decreased";
      let newValue = getProperty(this.data.data, valProp);
      newValue += value;  // this will subtract if value is negative
      setProperty(this.data.data, valProp, newValue);
      let ledger = getProperty(this.data.data, ledgerProp);
      ledger.push([`${prop} ${action} to ${newValue}`, reason]);
      setProperty(this.data.data, ledgerProp, ledger);
      this.update(this.data, {});
      return getProperty(this.data.data, prop);
    }
    return []; // there was an error, return empty
  }
  
  setLedgerProperty(prop, value, reason) {
    LOGGER.trace("CPRActor setLedgerProperty | called.");
    if (this.isLedgerProperty(prop)) {
      const valProp = prop + ".value";
      const ledgerProp = prop + ".transactions";
      setProperty(this.data.data, valProp, value);
      let ledger = getProperty(this.data.data, ledgerProp);
      ledger.push([`${prop} set to ${value}`, reason]);
      setProperty(this.data.data, ledgerProp, ledger);
      this.update(this.data, {});
      return getProperty(this.data.data, prop);
    }
    return []; // there was an error, return empty
  }

  listRecords(prop) {
    LOGGER.trace("CPRActor _listRecords | called.");
    if (this.isLedgerProperty(prop)) {
      return getProperty(this.data.data, prop + ".transactions");
    }
    return []; // there was an error, return empty
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
}
