import LOGGER from "../utils/cpr-logger.js";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRActor extends Actor {

  /** @override */
  prepareData() {
    LOGGER.trace("Prepare Data | CPRActor | Called.");
    super.prepareData();
    const actorData = this.data;
    this.data.filteredItems = this.itemTypes;
    LOGGER.trace("Prepare Character Data | CPRActor | Checking on contents of `filteredItems`.");
    // Make separate methods for each Actor type (character, mook, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'mook') this._prepareMookData(actorData); 
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

  /** @override */
  getRollData() {
    LOGGER.trace("Get Roll Data | CPRActor | Called.");
    const data = super.getRollData();
    return data;
  }
}
