/* global getProperty */

import * as CPRRolls from "../../rolls/cpr-rolls.js";
import DvUtils from "../../utils/cpr-dvUtils.js";
import LoadAmmoPrompt from "../../dialog/cpr-load-ammo-prompt.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * The Loadable mixin is meant for items that can be loaded with something. Usually
 * that means ammunition, but there are edge cases like batteries or other charges
 * that do not have a finite amount of shots. Note that "shooting" logic does not
 * belong here, this is just for loading and unloading.
 */
const Loadable = function Loadable() {
  /**
   * set the list of ammo types this item can load
   *
   * @async
   * @param {String} ammoList - the ammo type that can be loaded
   * @returns - the updated item document
   */
  this.setCompatibleAmmo = async function setCompatibleAmmo(ammoList) {
    LOGGER.trace("setCompatibleAmmo | Loadable | Called.");
    this.data.data.ammoVariety = ammoList;
    if (this.actor) {
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
    return this.update({ "data.ammoVariety": ammoList });
  };

  /**
   * Set DV table that a TOKEN (from an actor) will use when measuring distance. This also takes
   * whether the item is set to autofire or not.
   *
   * @async
   * @param {*} actor - actor associated with the token
   * @param {*} dvTable - which dvTable to use, overridden if autofire is set.
   */
  this._measureDv = async function _measureDv(actor, dvTable) {
    LOGGER.trace("_measureDv | Loadable | Called.");
    let newDvTable = dvTable;
    if (actor.sheet.token !== null) {
      const flag = getProperty(actor.data, `flags.cyberpunk-red-core.firetype-${this.data._id}`);
      if (flag === "autofire") {
        const afTable = (DvUtils.GetDvTables()).filter((name) => name.includes(dvTable) && name.includes("Autofire"));
        if (afTable.length > 0) {
          [newDvTable] = afTable;
        }
      }
      actor.sheet.token.update({ "flags.cprDvTable": newDvTable });
    }
  };

  /**
   * Unload this item if it has any ammo in it.
   *
   * @async
   * @returns - updated actor document, or null if this is not an owned item
   */
  this._weaponUnload = async function _weaponUnload() {
    LOGGER.trace("_weaponUnload | Loadable | Called.");
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
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
    return null;
  };

  /**
   * Load ammunition into this item. The only time an ammo ID is passed to this is
   * when it is being reloaded, meaning the ammo type is already set.
   *
   * @async
   * @param {String} reloadAmmoId - Id of the ammo being reloaded, null otherwise.
   * @returns null
   */
  this._weaponLoad = async function _weaponLoad(reloadAmmoId) {
    LOGGER.trace("_weaponLoad | Loadable | Called.");
    let selectedAmmoId = reloadAmmoId;
    const loadUpdate = [];
    if (this.actor) {
      if (!selectedAmmoId) {
        const ownedAmmo = this.actor.data.filteredItems.ammo;
        const validAmmo = [];
        Object.keys(ownedAmmo).forEach((index) => {
          const ammo = ownedAmmo[index];
          if (this.getRollData().ammoVariety.includes(ammo.getRollData().variety)) {
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
          SystemUtils.DisplayMessage("warn", (SystemUtils.Localize("CPR.messages.noValidAmmo")));
          return;
        }
        formData = await LoadAmmoPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
        if (formData === undefined) {
          return;
        }
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
          SystemUtils.DisplayMessage("warn", (SystemUtils.Localize("CPR.messages.ammoMissingFromGear")));
          return;
        }
        if (ammo.getRollData().amount === 0) {
          SystemUtils.DisplayMessage("warn", (SystemUtils.Localize("CPR.messages.reloadOutOfAmmo")));
          return;
        }

        // By the time we reach here, we know the weapon and ammo we are loading
        // Let's find out how much space is in the gun.
        const upgradeValue = this.getAllUpgradesFor("magazine");
        const upgradeType = this.getUpgradeTypeFor("magazine");
        const magazineSpace = (upgradeType === "override") ? upgradeValue - magazineData.value : magazineData.max - magazineData.value + upgradeValue;

        if (magazineSpace > 0) {
          if (Number(ammo.data.data.amount) >= magazineSpace) {
            magazineData.value += magazineSpace;
            await ammo._ammoDecrement(magazineSpace);
          } else {
            magazineData.value = Number(this.data.data.magazine.value) + Number(ammo.data.data.amount);
            await ammo._ammoDecrement(ammo.data.data.amount);
          }
        }
        loadUpdate.push({ _id: this.data._id, "data.magazine": magazineData });
      }
      this.actor.updateEmbeddedDocuments("Item", loadUpdate);
    }
  };

  /**
   * Figure out how many bullets to consume given a roll. Autofire and Suppressive
   * fire are 10 says the rules, it's 1 otherwise.
   *
   * @param {CPRRoll} cprRoll - a roll (presumably an attack roll)
   * @returns {Number} how many bullets to consume given the roll
   */
  this.bulletConsumption = function bulletConsumption(cprRoll) {
    LOGGER.trace("bulletConsumption | Loadable | Called.");
    let bulletCount = 1;
    if (cprRoll instanceof CPRRolls.CPRAutofireRoll || cprRoll instanceof CPRRolls.CPRSuppressiveFireRoll) {
      bulletCount = 10;
    }
    return bulletCount;
  };

  /**
   * Does this item have enough ammo for the attack?
   * @returns - true or false
   */
  this.hasAmmo = function hasAmmo(cprRoll) {
    LOGGER.trace("hasAmmo | Loadable | Called.");
    return (this.data.data.magazine.value - this.bulletConsumption(cprRoll)) >= 0;
  };

  /**
   * Set the amount of ammo in this item. If value has a + or - in front of it,
   * then the amount of ammo is changed by the value, rather than set to it.
   *
   * @param {String} value - a number with an optional + or - prefixing it
   */
  this.setWeaponAmmo = function setWeaponAmmo(value) {
    LOGGER.trace("setWeaponAmmo | Loadable | Called.");
    const maxAmmo = this.getRollData().magazine.max;
    if (this.type === "weapon") {
      if (value.charAt(0) === "+" || value.charAt(0) === "-") {
        this.getRollData().magazine.value = Math.clamped(0, this.getRollData().magazine.value + parseInt(value, 10), maxAmmo);
      } else {
        this.getRollData().magazine.value = Math.clamped(0, value, maxAmmo);
      }
    }
  };

  /**
   * Get the type of ammo loaded in this item.
   *
   * @returns {String}
   */
  this._getLoadedAmmoType = function _getLoadedAmmoType() {
    LOGGER.trace("_getLoadedAmmoType | Loadable | Called.");
    if (this.actor) {
      const ammo = this.actor.items.find((i) => i.data._id === this.data.data.magazine.ammoId);
      if (ammo) {
        return ammo.data.data.type;
      }
    }
    return undefined;
  };
};

export default Loadable;
