import { LOGGER } from "../utils/cpr-logger.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CPRActor extends Actor {

  /** @override */
  prepareData() {
    LOGGER.trace("Prepare Data | CPRActor | Called.");
    super.prepareData();
  }

  /* -------------------------------------------- */

  /** @override */
  getRollData() {
    const data = super.getRollData();
    return data;
  }
}
