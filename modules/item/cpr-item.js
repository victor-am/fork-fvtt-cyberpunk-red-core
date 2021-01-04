import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRItem extends Item {

    /* -------------------------------------------- */
    /** @override */
    prepareData() {
        LOGGER.trace("prepareData | CPRItem | Called.");
        super.prepareData();   
        const itemData = this.data.data;  
        LOGGER.debug("prepareData | CPRItem | Checking itemData.");
    }

    /* -------------------------------------------- */
    /** @override */
    getRollData() {
        LOGGER.trace("getRollData | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }
}