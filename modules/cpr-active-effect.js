/* global ActiveEffect */
import LOGGER from "./utils/cpr-logger.js";

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class CPRActiveEffect extends ActiveEffect {
  /**
   * Provide a few system-specific properties to ActiveEffects. The logic generally lives
   * in the "effects" mixin for items.
   *
   * @override
   * @private
   */
  _onCreate() {
    LOGGER.trace("_onCreate | CPRActiveEffect | Called.");

    /**
     * Should this active effect be visible to non-GMs?
     * @type {boolean}
     */
    this.revealed = false;

    /**
    * How is this ActiveEffect "used"? Consumed, turned on and off, equipped?
    * TODO: document allowed values and maybe use an enum
    * @type {String}
    */
    this.usage = null;
  }
}
