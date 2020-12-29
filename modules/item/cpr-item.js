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
        super.prepareData();   
        const itemData = this.data.data;  
        LOGGER.debug("Prepare Data | CPRItem | Checking itemData.");
        console.log(itemData);
    }

    /* -------------------------------------------- */
    /** @override */
    getRollData() {
        LOGGER.trace("Get Roll Data | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }
}