/* global duplicate */
import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to weapons.
 * @extends {CPRItem}
 */
export default class CPRWeaponItem extends CPRItem {
  /**
   * Dispatcher method for interacting with the weapon. Most of these methods are implemented
   * in the Loadable mixin.
   *
   * @async
   * @callback
   * @param {CPRActor} actor  - who is doing something with this weapon?
   * @param {*} actionAttributes - details from the event indicating what the actor is doing
   */
  async _weaponAction(actor, actionAttributes) {
    LOGGER.trace("_weaponAction | CPRWeaponItem | Called.");
    const actionData = actionAttributes["data-action"].nodeValue;
    switch (actionData) {
      case "select-ammo":
        this._weaponLoad();
        break;
      case "unload":
        this._weaponUnload();
        break;
      case "load":
        this._weaponLoad();
        break;
      case "reload-ammo":
        this._weaponLoad(this.data.data.magazine.ammoId);
        break;
      case "measure-dv":
        this._measureDv(actor, this.data.data.dvTable);
        break;
      default:
    }
    if (this.actor) {
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
  }

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
    let unusedSlots = itemData.attachmentSlots;
    itemData.upgrades.forEach((mod) => {
      unusedSlots -= mod.data.size;
    });
    return unusedSlots;
  }
}
