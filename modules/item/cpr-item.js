import LOGGER from "../utils/cpr-logger.js";
import { SelectAmmoPrompt } from "../dialog/cpr-select-ammo-prompt.js";
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
        LOGGER.debug("prepareData | CPRItem | Checking itemData.");
    }

    /* -------------------------------------------- */
    /** @override */
    getRollData() {
        LOGGER.trace("getRollData | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }

    // Generic item.doAction() method so any idem can be called to
    // perform an action.  This can be easily extended in the 
    // switch statement and adding additional methods for each item.
    doAction(actor, actionAttributes) {
        LOGGER.trace("doAction | CPRItem | Called.");
        const itemType = this.data.type;

        let changedItems = [];
        switch (itemType) {
            case "weapon": {
                this._weaponAction(actionAttributes);
                break;
            }
            case "ammo": {

            }
        }
        return;
    }

    _weaponAction(actionAttributes) {
        LOGGER.trace("_weaponAction | CPRItem | Called.");
        const actionData = actionAttributes['data-action'].nodeValue;
        
        switch (actionData) {
            case "new-ammo": {
                this._weaponUnload();
                this._weaponLoad();
            }
        }
        return;
    }

    async _weaponUnload() {
        LOGGER.trace("_weaponUnload | CPRItem | Called.");
        let updatedItems = [];
        if (this.actor) {

            //recover the ammo to the right object
            
            let ammoId = this.data.data.magazine.ammoId;
            if (ammoId) {

                let ammo = this.actor.items.find((i) => i.data._id == ammoId);
                console.log(this);
                let newAmmoValue = Number(ammo.data.data.amount) + Number(this.data.data.magazine.value);
                updatedItems.push({_id: ammo._id, "data.amount": newAmmoValue});
            }
        }

        updatedItems.push({_id: this.data._id, "data.magazine.ammoId": ""});
        updatedItems.push({_id: this.data._id, "data.magazine.value": 0});
        await this.actor.updateEmbeddedEntity("OwnedItem", updatedItems);
    }

    async _weaponLoad(selectedAmmoId) {
        LOGGER.trace("_weaponLoad | CPRItem | Called.");

        if (this.actor) {
            if (!selectedAmmoId) {
                const ownedAmmo = this.actor.data.filteredItems['ammo'];

                let validAmmo = [];

                for (let a of ownedAmmo) {
                    if (this.data.data.ammoVariety.includes(a.data.data.variety)) {
                        validAmmo.push(a);
                    }
                }

                let dialogData = {
                    "weapon": this,
                    "ammoList": validAmmo,
                    "selectedAmmo": ""
                };


                dialogData = await SelectAmmoPrompt(dialogData);
                

                if (dialogData.selectedAmmo === "") {
                    return;
                }

                selectedAmmoId = dialogData.selectedAmmo;
            }



            if (selectedAmmoId) {
                let updatedItems = [];
                updatedItems.push({_id: this.data._id, "data.magazine.ammoId": selectedAmmoId});
              
                let ammo = this.actor.items.find((i) => i.data._id == selectedAmmoId);
  
                // By the time we reach here, we know the weapon and ammo we are loading
                // Let's find out how much space is in the gun.

                const magazineSpace = Number(this.data.data.magazine['max']) - Number(this.data.data.magazine['value']);

                if (magazineSpace > 0) {
                    if (Number(ammo.data.data.amount) >= magazineSpace) {
                        updatedItems.push({_id: this.data._id, "data.magazine.value": this.data.data.magazine.max});
                        let ammoUsed = Number(ammo.data.data.amount) - magazineSpace;
                        updatedItems.push({_id: ammo.data._id, "data.amount": ammoUsed});
                    }
                    else {
                        let newAmmoValue = Number(this.data.data.magazine['value']) + Number(ammo.data.data.amount);
                        updatedItems.push({_id: this.data._id, "data.magazine.value": newAmmoValue});
                        updatedItems.push({_id: ammo.data._id, "data.amount": 0});
                    }
                    
                }
                await this.actor.updateEmbeddedEntity("OwnedItem", updatedItems);
            }

        }

    }
}
