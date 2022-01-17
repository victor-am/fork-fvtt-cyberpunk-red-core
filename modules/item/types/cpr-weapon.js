/* global duplicate */
import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to weapons.
 * @extends {CPRItem}
 */
export default class CPRWeaponItem extends CPRItem {
  /**
   * Dynamically calculates the number of free upgrade slots on the weapon
   * by starting with the number of slots this weapon has and substacting
   * the slot size of each of the upgrades.
   *
   * @public
   */
  availableSlots() {
    LOGGER.trace("availableSlots | CPRWeaponItem | Called.");
    const itemData = duplicate(this.data.data);
    let unusedSlots = itemData.slots;
    itemData.upgrades.forEach((mod) => {
      unusedSlots -= mod.data.size;
    });
    return unusedSlots;
  }
}
