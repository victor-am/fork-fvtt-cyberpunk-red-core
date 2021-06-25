/* globals Actor game */
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
}
