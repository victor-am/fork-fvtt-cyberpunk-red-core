/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* global Item */
import LOGGER from "../utils/cpr-logger.js";
import LoadAmmoPrompt from "../dialog/cpr-load-ammo-prompt.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import Rules from "../utils/cpr-rules.js";

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
    // const itemData = this.data.data;
    LOGGER.debug("prepareData | CPRItem | Checking itemData.");
  }

  /* -------------------------------------------- */
  /** @override */
  getRollData() {
    LOGGER.trace("getRollData | CPRItem | Called.");
    const data = super.getRollData();
    return data;
  }

  getData() {
    LOGGER.trace("getData | CPRItem | Called.");
    return this.data.data;
  }

  update(data, options = {}) {
    if (data['data.type'] === "cyberwareInternal" || data['data.type'] === "cyberwareExternal" || data['data.type'] === "fashionware") {
      data['data.isFoundational'] = false;
    }
    super.update(data, options);
  }

  // Generic item.doAction() method so any idem can be called to
  // perform an action.  This can be easily extended in the
  // switch statement and adding additional methods for each item.
  // Prepatory work for
  // Click to Consume (Apply mods / effect / state change)
  // Opening Agent Dialog
  // Any calls to functions not related to rolls, triggered from actions.
  // actorSheet UX gets actived -> actorSheet.eventFunction(event) ->
  doAction(actor, actionAttributes) {
    LOGGER.debug("doAction | CPRItem | Called.");
    const itemType = this.data.type;
    // const changedItems = [];
    switch (itemType) {
      case "weapon":
        this._weaponAction(actionAttributes);
        break;
      case "ammo":
        this._ammoAction(actionAttributes);
        break;
      default:
    }
  }

  // ammo Item Methods
  // TODO - REFACTOR, do not do this...
  _ammoAction(actionAttributes) {
    LOGGER.debug("_ammoAction | CPRItem | Called.");
    const actionData = actionAttributes["data-action"].nodeValue;
    const ammoAmount = actionAttributes["data-amount"].nodeValue;
    switch (actionData) {
      case "ammo-decrement":
        this._ammoDecrement(ammoAmount);
        break;
      case "ammo-increment":
        this._ammoIncrement(ammoAmount);
        break;
      default:
    }

    // If the actor, is updating his owned item, this logic should live within the actor.
    if (this.actor) {
      this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  // SKILL FUNCTIONS
  setSkillLevel(value) {
    LOGGER.debug("setSkillLevel | CPRItem | Called.");
    if (this.type === "skill") {
      this.getData().level = Math.clamped(-99, value, 99);
    }
  }

  async setCompatibleAmmo(ammoList) {
    this.data.data.ammoVariety = ammoList;
    if (this.actor) {
      this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
    return this.update({ "data.ammoVariety": ammoList });
  }

  // AMMO FUNCTIONS
  _ammoDecrement(changeAmount) {
    LOGGER.debug("_ammoDecrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Math.max(0, Number(currentValue) - Number(changeAmount));
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  _ammoIncrement(changeAmount) {
    LOGGER.debug("_ammoIncrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Number(currentValue) + Number(changeAmount);
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  // Weapon Item Methods
  // TODO - Refactor
  async _weaponAction(actionAttributes) {
    LOGGER.debug("_weaponAction | CPRItem | Called.");
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
      default:
    }
    if (this.actor) {
      this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  // TODO - Refactor
  async _weaponUnload() {
    LOGGER.debug("_weaponUnload | CPRItem | Called.");
    if (this.actor) {
      // recover the ammo to the right object
      const { ammoId } = this.data.data.magazine;
      if (ammoId) {
        const ammo = this.actor.items.find((i) => i.data._id === ammoId);

        if (ammo !== null) {
          if (this.data.data.magazine.value > 0) {
            if (ammoId) {
              await ammo._ammoIncrement(this.data.data.magazine.value);
            }
          }
        }
      }
      this.data.data.magazine.value = 0;
      this.data.data.magazine.ammoId = "";
      return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  // TODO - Refactor
  async _weaponLoad(selectedAmmoId) {
    LOGGER.debug("_weaponLoad | CPRItem | Called.");
    const loadUpdate = [];
    if (this.actor) {
      if (!selectedAmmoId) {
        const ownedAmmo = this.actor.data.filteredItems.ammo;
        const validAmmo = [];
        Object.keys(ownedAmmo).forEach((index) => {
          const ammo = ownedAmmo[index];
          if (this.getData().ammoVariety.includes(ammo.getData().variety)) {
            validAmmo.push(ammo);
          }
        });

        let formData = {
          weapon: this,
          ammoList: validAmmo,
          selectedAmmo: "",
          returnType: "string",
        };

        if (validAmmo.length === 0) {
          SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.novalidammo")));
          return;
        }

        formData = await LoadAmmoPrompt.RenderPrompt(formData);

        selectedAmmoId = formData.selectedAmmo;
      }

      const loadedAmmo = this.data.data.magazine.ammoId;

      if (loadedAmmo !== "" && loadedAmmo !== selectedAmmoId) {
        await this._weaponUnload();
      }

      if (selectedAmmoId) {
        const magazineData = this.data.data.magazine;

        magazineData.ammoId = selectedAmmoId;

        loadUpdate.push({ _id: this.data._id, "data.magazine.ammoId": selectedAmmoId });

        const ammo = this.actor.items.find((i) => i.data._id === selectedAmmoId);

        if (ammo === null) {
          SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.ammomissingfromgear")));
          return;
        }

        if (ammo.getData().amount === 0) {
          SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.reloadoutofammo")));
          return;
        }

        // By the time we reach here, we know the weapon and ammo we are loading
        // Let's find out how much space is in the gun.

        const magazineSpace = Number(this.data.data.magazine.max) - Number(this.data.data.magazine.value);

        if (magazineSpace > 0) {
          if (Number(ammo.data.data.amount) >= magazineSpace) {
            magazineData.value = magazineData.max;
            await ammo._ammoDecrement(magazineSpace);
          } else {
            magazineData.value = Number(this.data.data.magazine.value) + Number(ammo.data.data.amount);
            await ammo._ammoDecrement(ammo.data.data.amount);
          }
        }
        loadUpdate.push({ _id: this.data._id, "data.magazine": magazineData });
      }
      this.actor.updateEmbeddedEntity("OwnedItem", loadUpdate);
    }
  }

  // Returns true if weapon fired, otherwise returns false.
  fireRangedWeapon(rateOfFire) {
    LOGGER.debug("fireRangedWeapon | CPRItem | Called.");
    let bulletCount = 0;
    switch (rateOfFire) {
      case "single":
        bulletCount = 1;
        break;
      case "suppressive":
      case "autofire":
        bulletCount = 10;
        break;
      default:
    }

    if (this.data.data.magazine.value < bulletCount) {
      Rules.lawyer(false, "CPR.weaponattackoutofbullets");
      return false;
    }

    // PLAY GUN SOUND!!
    this.data.data.magazine.value -= bulletCount;
    return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
  }

  toggleFavorite() {
    this.data.data.favorite = !this.data.data.favorite;
  }
}
