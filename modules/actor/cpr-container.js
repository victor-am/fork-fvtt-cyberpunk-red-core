/* globals Actor */
import LOGGER from "../utils/cpr-logger.js";

/**
 * @extends {Actor}
 */
export default class CPRContainerActor extends Actor {
  prepareData() {
    LOGGER.trace("prepareData | CPRActor | Called.");
    super.prepareData();
    if (this.compendium === null || this.compendium === undefined) {
      // It looks like prepareData() is called for any actors/npc's that exist in
      // the game and the clients can't update them.  Everyone should only calculate
      // their own derived stats, or the GM should be able to calculate the derived
      // stat
      const actorData = this.data;
      actorData.filteredItems = this.itemTypes;
    }
  }

  /**
   * automaticallyStackItems searches for an identical item on the actor
   * and if found increments the amount and price for the item on the actor
   * instead of adding it as a new item.
   *
   * @param {Object} newItem - an object containing the new item
   * @returns {boolean} - true if thee item should be added normally
   *                    - false if it has been stacked on an existing item
   */
  automaticallyStackItems(newItem) {
    const stackableItemTypes = ["ammo", "gear", "clothing"];
    if (stackableItemTypes.includes(newItem.type)) {
      const match = this.items.find((i) => i.type === newItem.type && i.name === newItem.name && i.data.data.upgrades.length === 0);
      if (match) {
        let oldAmount = parseInt(match.data.data.amount, 10);
        let addedAmount = parseInt(newItem.data.data.amount, 10);
        if (Number.isNaN(oldAmount)) { oldAmount = 1; }
        if (Number.isNaN(addedAmount)) { addedAmount = 1; }
        const newAmount = oldAmount + addedAmount;
        this.updateEmbeddedDocuments("Item", [{ _id: match.id, "data.amount": newAmount.toString() }]);
        return false;
      }
    }
    // If not stackable, then return true to continue adding the item.
    return true;
  }
}
