/* globals Actor */
import LOGGER from "../utils/cpr-logger.js";

/**
 * Container actors function like loot boxes, player or party stashes, stores, and
 * vending machines. Note this does not extend CPRActor.
 *
 * @extends {Actor}
 */
export default class CPRContainerActor extends Actor {
  /**
   * prepareData is called before the actor is vendored to clients, so we can filter
   * or streamline the data for convenience.
   */
  prepareData() {
    LOGGER.trace("prepareData | CPRContainerActor | Called.");
    super.prepareData();
    if (this.compendium === null || this.compendium === undefined) {
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
    LOGGER.trace("automaticallyStackItems | CPRContainerActor | Called.");
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

  /**
   * This is the callback for setting the container type.
   *
   * @callback
   * @public
   * @param {} event - object capturing event data (what was clicked and where?)
   */
  async setContainerType(containerType) {
    LOGGER.trace("setContainerType | CPRContainerActor | Called.");
    await this.setFlag("cyberpunk-red-core", "container-type", containerType);
    switch (containerType) {
      case "shop": {
        await this.unsetFlag("cyberpunk-red-core", "items-free");
        await this.unsetFlag("cyberpunk-red-core", "players-create");
        await this.unsetFlag("cyberpunk-red-core", "players-delete");
        await this.unsetFlag("cyberpunk-red-core", "players-modify");
        await this.unsetFlag("cyberpunk-red-core", "players-move");
        break;
      }
      case "loot": {
        await this.unsetFlag("cyberpunk-red-core", "infinite-stock");
        await this.setFlag("cyberpunk-red-core", "items-free", true);
        await this.unsetFlag("cyberpunk-red-core", "players-create");
        await this.unsetFlag("cyberpunk-red-core", "players-delete");
        await this.unsetFlag("cyberpunk-red-core", "players-modify");
        await this.unsetFlag("cyberpunk-red-core", "players-move");
        break;
      }
      case "stash": {
        await this.unsetFlag("cyberpunk-red-core", "infinite-stock");
        await this.setFlag("cyberpunk-red-core", "items-free", true);
        await this.setFlag("cyberpunk-red-core", "players-create", true);
        await this.setFlag("cyberpunk-red-core", "players-delete", true);
        await this.setFlag("cyberpunk-red-core", "players-modify", true);
        await this.setFlag("cyberpunk-red-core", "players-move", true);
        break;
      }
      case "custom": {
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
   * A utility method that toggles a flag back and forth. If defined, it is
   * set to true, but when it should be "false" we just remove it.
   *
   * @param {*} flagName - a name for the flag to set/unset
   * @returns {Document} representing the flag
   */
  async toggleFlag(flagName) {
    LOGGER.trace("toggleFlag | CPRContainerActor | Called.");
    const flag = this.getFlag("cyberpunk-red-core", flagName);
    if (flag === undefined || flag === false) {
      return this.setFlag("cyberpunk-red-core", flagName, true);
    }
    return this.unsetFlag("cyberpunk-red-core", flagName);
  }
}
