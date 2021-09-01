import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to gear.
 * @extends {CPRItem}
 */
export default class CPRGearItem extends CPRItem {
  /**
   * Gear is always a physical item, so we automatically activate that mixin
   *
   * @param {*} data
   * @param {*} options
   * @param {*} userId
   */
  _onCreate(data, options, userId) {
    LOGGER.trace("_onCreate | CPRGearItem | Called.");
    LOGGER.debugObject(data);
    LOGGER.debugObject(options);
    LOGGER.debugObject(userId);
    super._onCreate(data, options, userId);
    this.loadMixin("physical");
    LOGGER.debugObject(this);
  }
}
