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
        if (this.data.type === "weapon") {
            this.data.data.ammoVariety = ["medPistol"];
        }
        const itemData = this.data.data;  
        console.log(this);
        console.log(itemData);
        LOGGER.debug("prepareData | CPRItem | Checking itemData.");
    }

    /* -------------------------------------------- */
    /** @override */
    getRollData() {
        LOGGER.trace("getRollData | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }

    reloadWeapon(ammoObject) {
        console.log("reload weapon");
        console.log(this);
    }
}