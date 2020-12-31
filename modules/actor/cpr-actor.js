import LOGGER from "../utils/cpr-logger.js";
import { BaseRoll } from "../system/dice.js";
import ActorUtils from "../utils/actorUtils.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRActor extends Actor {

  /** @override */
  prepareData() {
    LOGGER.trace("Prepare Data | CPRActor | Called.");
    LOGGER.debug(this);
    super.prepareData();
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;

    LOGGER.debug("Prepare Character Data | CPRActor | Checking on contents of `filteredItems`.");
    console.log(actorData.filteredItems);
    
    // Prepare data for both types
    this._calculateDerivedStats(actorData);

    // Prepare type data
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'mook') this._prepareMookData(actorData); 
  }

  /** @override */
  getRollData() {
    LOGGER.trace("Get Roll Data | CPRActor | Called.");
    const data = super.getRollData();
    return data;
  }

  /** @override */
  static async create(data, options) {
    LOGGER.trace(`Create | CPRActor | called.`);
    data.items = [];
    switch (data.type) {
      default: data.items = data.items.concat(await ActorUtils.getBasicSkills());
    }
    super.create(data, options);
  }

  _prepareCharacterData(actorData) {
    LOGGER.trace("Prepare Character Data | CPRActor | Called.");
    const data = actorData.data;
    LOGGER.trace("Prepare Character Data | CPRActor | Checking on contents of `actorData.data`.");
    console.log(data)
  }

  _prepareMookData(actorData) {
    LOGGER.trace("Prepare Mook Data | CPRActor | Called.");
    const data = actorData.data;
    LOGGER.trace("Prepare Mook Data | CPRActor | Checking on contents of `actorData.data`.");
    console.log(data)
  }

  _calculateDerivedStats(actorData) {
    // Calculate MAX HP
    LOGGER.trace(`ActorID _calculateDerivedStats | CPRActorSheet | Called.`);
    let stats = actorData.stats;
    let derivedStats = actorData.derivedStats;

    // Set max HP
    derivedStats.hp.max = 10 + 5*(Math.ceil((stats.will.value + stats.body.value) / 2));
    if (derivedStats.hp.value > derivedStats.hp.max) derivedStats.hp.value = derivedStats.hp.max;

    // Seriously wounded
    derivedStats.seriouslyWounded = Math.ceil(hp.max / 2);

    // Death save
    derivedStats.deathSave = body.value;
    
    // Max Humanity
    // TODO-- Subtract installed cyberware...
    hum.max = 10 * emp.value;
    if (hum.value > hum.max) hum.value = hum.max;
  }

}
