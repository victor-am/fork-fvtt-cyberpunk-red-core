/* global duplicate */

import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to cyberware.
 * @extends {CPRItem}
 */
export default class CPRCyberwareItem extends CPRItem {
  /**
   * Dynamically calculates the number of free slots on the cyberware
   * by starting with the number of slots this cyberware has and substacting
   * the slot size of each of the installed options.
   *
   * @public
   */
  availableSlots() {
    LOGGER.trace("availableSlots | CPRCyberwareItem | Called.");
    const itemData = duplicate(this.data.data);
    let unusedSlots = itemData.optionSlots - itemData.installedOptionSlots;
    itemData.upgrades.forEach((mod) => {
      unusedSlots -= mod.data.size;
    });
    return unusedSlots;
  }
}
