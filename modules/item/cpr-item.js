import LOGGER from "../utils/cpr-logger.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRItem extends Item {

    /* -------------------------------------------- */
    /** @override */
    prepareData() {
        LOGGER.trace("Prepare Data | CPRItem | Called.");
        // Why call super here?
        super.prepareData();   
        const itemData = this.data.data;  
        const actorData = this.actor ? this.actor.data : {};
        LOGGER.debug("Prepare Data | CPRItem | Checking itemData.");
        console.log(itemData);
        // Do things yonder...
    }

    /* -------------------------------------------- */
    /** @override */
    getRollData() {
        LOGGER.trace("Get Roll Data | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }
}