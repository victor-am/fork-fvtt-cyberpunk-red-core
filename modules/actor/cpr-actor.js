/* globals Actor */
import LOGGER from "../utils/cpr-logger.js";
// import ActorUtils from "../utils/cpr-actorUtils";
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
    LOGGER.debug(
      "Prepare Character Data | CPRActor | Checking on contents of `filteredItems`.",
    );

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
    data.items = [];
    switch (data.type) {
      // default: data.items = data.items.concat(await ActorUtils.GetAllSkills());
      default:
        data.items = data.items.concat(await SystemUtils.GetCoreSkills());
    }
    super.create(data, options);
  }

  _prepareCharacterData(actorData) {
    LOGGER.trace("_prepareCharacterData | CPRActor | Called.");
    const { data } = actorData;
    LOGGER.trace("_prepareCharacterData | CPRActor | Checking on contents of `actorData.data`.");
  }

  _prepareMookData(actorData) {
    LOGGER.trace("_prepareMookData | CPRActor | Called.");
    const { data } = actorData;
    LOGGER.trace("_prepareMookData | CPRActor | Checking on contents of `actorData.data`.");
  }

  _calculateDerivedStats(actorData) {
    // Calculate MAX HP
    LOGGER.trace("_calculateDerivedStats | CPRActor | Called.");

    const { stats } = actorData.data;
    const { derivedStats } = actorData.data;

    // Set max HP
    derivedStats.hp.max = 10 + 5 * Math.ceil((stats.will.value + stats.body.value) / 2);

    derivedStats.hp.value = Math.min(
      derivedStats.hp.value,
      derivedStats.hp.max,
    );
    // if (derivedStats.hp.value > derivedStats.hp.max) { derivedStats.hp.value = derivedStats.hp.max; };

    // Seriously wounded
    // Do we really need to store this or can we just calculate it dynamically as needed???
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    if (derivedStats.hp.value < derivedStats.hp.max) {
      this.setWoundState();
    }
    // Death save
    derivedStats.deathSave = stats.body.value;

    // Humanity is a character statistic, not a Mook
    if (actorData.type === "character") {
      const { humanity } = actorData.data;
      // Max Humanity
      // TODO-- Subtract installed cyberware...
      humanity.max = 10 * stats.emp.max;
      if (humanity.value > humanity.max) {
        humanity.value = humanity.max;
      }
      // Setting EMP to value based on current humannity.
      stats.emp.value = Math.floor(humanity.value / 10);
    }
  }

  // GET AND SET WOUND STATE
  getWoundState() {
    LOGGER.trace("getWoundState | CPRActor | Obtaining Wound State.");
    return this.data.data.woundState.currentWoundState;
  }

  setWoundState(actorData) {
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
    return this.filteredItems.cyberware.filter((item) => item.isInstalled);
  }

  /**
   *
   * @param {string} type uses the type of a cyberware item to return a list of compatiable foundational cyberware installed.
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

  // ADD AND REMOVE CYBERWARE FROM ACTOR
  // TODO - Refactor to map struct?

  // Current implementation is as follows.
  // Each foundational cyberware added creates a new array in cyberware.
  // the foundational item is the 0th element of the array.
  // when optional cyberware looks for places to go.
  // look at all arrays in cyberware.installed
  // if 0th element for type = optional.type && array.length < 0th.slots + 1
  // display in list of possibly locations to install
  // confirm will install and push optional.id into selected array
  addCyberware(item) {
    LOGGER.trace("addCyberware | CPRActor | Called.");
    const data = this.getData();
    LOGGER.trace(data);
    // add this as foundational
    if (item.getData().isFoundational) {
      LOGGER.debug(
        "addCyberware | CPRActor | Adding new foundational Cyberware to struct.",
      );
      // TODO - Logic to warn of rules breaking.
      data.cyberware.installed[item._id] = [];
      // add this as optional
    } else {
      // display prompt
    }
  }

  removeCyberware(item) {
    LOGGER.debug("removeCyberware | CPRActor | Called.");
    if (item.getData().isFoundational) {
      // TODO - disallow removal if has optional slots occupied.
    } else {
      // TODO - remove optional
    }
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id === itemId);
  }
}
