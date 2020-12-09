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
  }

  /** @override */
  getRollData() {
    LOGGER.trace("Get Roll Data | CPRActor | Called.");
    const data = super.getRollData();
    return data;
  }
}
