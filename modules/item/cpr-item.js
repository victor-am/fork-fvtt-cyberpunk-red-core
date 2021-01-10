import LOGGER from "../utils/cpr-logger.js";
import { SelectAmmoPrompt } from "../dialog/cpr-select-ammo-prompt.js";


/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRItem extends Item {

    /* -------------------------------------------- */
    /** @override */
    prepareData() {
        LOGGER.debug(`prepareData | CPRItem | Called for type: ${this.type}.`);
        super.prepareData();
        // If you want to test/see ammo working before we can set ammoVariety
        // uncomment these 3 lines
/*        if (this.data.type === "weapon") {
            this.data.data.ammoVariety = ["medPistol"];
        }
        */
        const itemData = this.data.data;
        LOGGER.debug(`prepareData | CPRItem | Checking itemData.`);
    }

    /* -------------------------------------------- */
    /** @override */
    async getRollData() {
        LOGGER.trace("getRollData | CPRItem | Called.");
        const data = super.getRollData();
        return data;
    }

    // Generic item.doAction() method so any idem can be called to
    // perform an action.  This can be easily extended in the 
    // switch statement and adding additional methods for each item.
    doAction(actor, actionAttributes) {
        LOGGER.debug("doAction | CPRItem | Called.");

        const itemType = this.data.type;

        let changedItems = [];
        switch (itemType) {
            case "weapon": {
                this._weaponAction(actionAttributes);
                break;
            }
            case "ammo": {
                this._ammoAction(actionAttributes);
                break;

            }
        }
        return;
    }

    // ammo Item Methofs

    async _ammoAction(actionAttributes) {
        LOGGER.debug("_ammoAction | CPRItem | Called.");

        const actionData = actionAttributes['data-action'].nodeValue;
        const ammoAmount = actionAttributes['data-amount'].nodeValue;
        switch (actionData) {
            case "ammo-decrement": {
                await this._ammoDecrement(ammoAmount);
                break;
            }
            case "ammo-increment": {
                await this._ammoIncrement(ammoAmount);
                break;
            }
        }

        if (this.actor) {
            await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
        }
    }

    async _ammoDecrement(changeAmount) {
        LOGGER.debug("_ammoDecrement | CPRItem | Called.");
        let currentValue = this.data.data.amount;
        let newValue = Math.max(0, (Number(currentValue) - Number(changeAmount)));
        this.data.data.amount = newValue;
        if (this.actor) {
            await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
        }
    }

    async _ammoIncrement(changeAmount) {
        LOGGER.debug("_ammoIncrement | CPRItem | Called.");
        let currentValue = this.data.data.amount;
        let newValue = Number(currentValue) + Number(changeAmount);
        this.data.data.amount = newValue;
        if (this.actor) {
            await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
        }
    }

    // Weapon Item Methods

    async _weaponAction(actionAttributes) {
        LOGGER.debug("_weaponAction | CPRItem | Called.");
        const actionData = actionAttributes['data-action'].nodeValue;

        let weaponUpdate = [];

        switch (actionData) {
            case "new-ammo": {
                await this._weaponUnload();
                await this._weaponLoad();
                break;
            }
            case "unload": {
                await this._weaponUnload();
                break;
            }
            case "load": {
                await this._weaponLoad();
                break;
            }
            case "reload-ammo": {
                await this._weaponLoad(this.data.data.magazine.ammoId);
                break;
            }

        }
        if (this.actor) {
            await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
        }
        return;
    }

    async _weaponUnload() {
        LOGGER.debug("_weaponUnload | CPRItem | Called.");
        if (this.actor) {
            //recover the ammo to the right object
            let ammoId = this.data.data.magazine.ammoId;
            let ammo = this.actor.items.find((i) => i.data._id == ammoId);

            if (this.data.data.magazine.value > 0) {
                if (ammoId) {
                    await ammo._ammoIncrement(this.data.data.magazine.value);
                }
            }
        }
        this.data.data.magazine.value = 0;
        this.data.data.magazine.ammoId = "";
        if (this.actor) {
            await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
        }
    }

    async _weaponLoad(selectedAmmoId) {
        LOGGER.debug("_weaponLoad | CPRItem | Called.");
        let loadUpdate = [];

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

                let magazineData = this.data.data.magazine;

                magazineData.ammoId = selectedAmmoId;

                //loadUpdate.push({ _id: this.data._id, "data.magazine.ammoId": selectedAmmoId });

                let ammo = this.actor.items.find((i) => i.data._id == selectedAmmoId);

                // By the time we reach here, we know the weapon and ammo we are loading
                // Let's find out how much space is in the gun.

                const magazineSpace = Number(this.data.data.magazine['max']) - Number(this.data.data.magazine['value']);

                if (magazineSpace > 0) {
                    if (Number(ammo.data.data.amount) >= magazineSpace) {
                        magazineData.value = magazineData.max;
                        //loadUpdate.push({ _id: this.data._id, "data.magazine.value": this.data.data.magazine.max });
                        let ammoUsed = Number(ammo.data.data.amount) - magazineSpace;
                        loadUpdate.push({ _id: ammo.data._id, "data.amount": ammoUsed });
                    }
                    else {
                        
                        magazineData.value = Number(this.data.data.magazine['value']) + Number(ammo.data.data.amount);
                        //loadUpdate.push({ _id: this.data._id, "data.magazine.value": newAmmoValue });
                        loadUpdate.push({ _id: ammo.data._id, "data.amount": 0 });
                    }

                }
                loadUpdate.push({ _id: this.data._id, "data.magazine": magazineData });
             
            }
            await this.actor.updateEmbeddedEntity("OwnedItem", loadUpdate);
        }
    }

    async fireRangedWeapon(rateOfFire) {
        LOGGER.debug("fireRangedWeapon | CPRItem | Called.");
        console.log(rateOfFire);
        let bulletCount = 0;
        switch (rateOfFire) {
            case "single": {
                bulletCount = 1;
                break;
            }
            case "suppressive":
            case "autofire": {
                bulletCount = 10;
                break;
            }
        }

        if (this.data.data.magazine.value < bulletCount) {
            // CLICK?!
        }
        else {
            console.log(this.data.data.magazine.value);
            this.data.data.magazine.value -= bulletCount;
            console.log(this.data.data.magazine.value);
        }
        await this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
}
