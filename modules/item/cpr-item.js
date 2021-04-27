/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* global Item game */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import CPR from "../system/config.js";
import LOGGER from "../utils/cpr-logger.js";
import LoadAmmoPrompt from "../dialog/cpr-load-ammo-prompt.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";

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
    if (this.data.type === "weapon") {
      data['data.dvTable'] = data['data.dvTable'] === null ? "" : data['data.dvTable'];
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
        this._weaponAction(actor, actionAttributes);
        break;
      case "ammo":
        this._ammoAction(actionAttributes);
        break;
      default:
    }
  }

  confirmRoll(cprRoll) {
    LOGGER.trace("confirmRoll | CPRItem | Called.");
    const itemType = this.data.type;
    const localCprRoll = cprRoll;
    if (itemType === "weapon") {
      if (localCprRoll instanceof CPRRolls.CPRAttackRoll) {
        if (this.data.data.isRanged) {
          this.fireRangedWeapon(localCprRoll);
          const ammoType = this._getLoadedAmmoType();
          if (ammoType !== "undefined") {
            localCprRoll.rollCardExtraArgs.ammoType = ammoType;
          }
        }
      }
      if (localCprRoll instanceof CPRRolls.CPRDamageRoll) {
        if (localCprRoll.isAutofire) {
          localCprRoll.setAutofire();
        }
      }
    }
    return localCprRoll;
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

  setSkillMod(value) {
    LOGGER.debug("setSkillMod | CPRItem | Called.");
    if (this.type === "skill") {
      this.getData().skillmod = Math.clamped(-99, value, 99);
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
  async _ammoDecrement(changeAmount) {
    LOGGER.debug("_ammoDecrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Math.max(0, Number(currentValue) - Number(changeAmount));
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  async _ammoIncrement(changeAmount) {
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
  async _weaponAction(actor, actionAttributes) {
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
      case "measure-dv":
        this._measureDv(actor, this.data.data.dvTable);
        break;
      default:
    }
    if (this.actor) {
      this.actor.updateEmbeddedEntity("OwnedItem", this.data);
    }
  }

  async _measureDv(actor, dvTable) {
    LOGGER.debug("_measureDv | CPRItem | Called.");
    if (actor.sheet.token !== null) {
      actor.sheet.token.update({ "flags.cprDvTable": dvTable });
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

  static bulletConsumption(cprRoll) {
    LOGGER.trace("bulletConsumption | CPRItem | Called.");
    let bulletCount = 1;
    if (cprRoll instanceof CPRRolls.CPRAutofireRoll || cprRoll instanceof CPRRolls.CPRSuppressiveFireRoll) {
      bulletCount = 10;
    }
    return bulletCount;
  }

  hasAmmo(cprRoll) {
    LOGGER.trace("checkAmmo | CPRItem | Called.");
    return (this.data.data.magazine.value - CPRItem.bulletConsumption(cprRoll)) >= 0;
  }

  setWeaponAmmo(value) {
    LOGGER.debug("setWeaponAmmo | CPRItem | Called.");
    const maxAmmo = this.getData().magazine.max;
    if (this.type === "weapon") {
      if (value.charAt(0) === "+" || value.charAt(0) === "-") {
        this.getData().magazine.value = Math.clamped(0, this.getData().magazine.value + parseInt(value, 10), maxAmmo);
      } else {
        this.getData().magazine.value = Math.clamped(0, value, maxAmmo);
      }
    }
  }

  // Returns true if weapon fired, otherwise returns false.
  fireRangedWeapon(cprRoll) {
    LOGGER.trace("fireRangedWeapon | CPRItem | Called.");
    const discharged = CPRItem.bulletConsumption(cprRoll);
    // don't go negative
    this.data.data.magazine.value = Math.max(this.data.data.magazine.value - discharged, 0);
    return this.actor.updateEmbeddedEntity("OwnedItem", this.data);
  }

  _getLoadedAmmoType() {
    LOGGER.trace("_getAmmoType | CPRItem | Called.");
    if (this.actor) {
      const ammo = this.actor.items.find((i) => i.data._id === this.data.data.magazine.ammoId);
      if (ammo) {
        return ammo.data.data.type;
      }
    }
    return undefined;
  }

  toggleFavorite() {
    this.data.data.favorite = !this.data.data.favorite;
  }

  createRoll(type, actor) {
    LOGGER.trace("createRoll | CPRItem | Called.");
    switch (type) {
      case CPRRolls.rollTypes.SKILL: {
        return this._createSkillRoll(actor);
      }
      case CPRRolls.rollTypes.SUPPRESSIVE:
      case CPRRolls.rollTypes.AUTOFIRE:
      case CPRRolls.rollTypes.AIMED:
      case CPRRolls.rollTypes.ATTACK: {
        return this.createAttackRoll(type, actor);
      }
      case CPRRolls.rollTypes.DAMAGE: {
        return this.createDamageRoll(type);
      }
      default:
    }
  }

  _createSkillRoll(actor) {
    LOGGER.trace("_createSkillRoll | CPRItem | Called.");
    const itemData = this.data.data;
    const statName = itemData.stat;
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = actor.getStat(statName);
    const skillName = this.name;
    const skillLevel = itemData.level;
    const cprRoll = new CPRRolls.CPRSkillRoll(niceStatName, statValue, skillName, skillLevel);
    cprRoll.addMod(actor.getArmorPenaltyMods(statName));
    cprRoll.addMod(actor.getWoundStateMods());
    cprRoll.addMod(this._getSkillMod());
    return cprRoll;
  }

  createAttackRoll(type, actor) {
    LOGGER.trace("_createAttackRoll | CPRItem | Called.");
    const weaponData = this.data.data;
    const weaponName = this.name;
    const { weaponType } = weaponData;
    let skillItem = actor.items.find((i) => i.name === weaponData.weaponSkill);

    if (type === CPRRolls.rollTypes.SUPPRESSIVE || type === CPRRolls.rollTypes.AUTOFIRE) {
      skillItem = actor.items.find((i) => i.name === "Autofire");
      if (this.data.data.weaponType !== "smg" && this.data.data.weaponType !== "heavySmg" && this.data.data.weaponType !== "assaultRifle") {
        Rules.lawyer(false, "CPR.weapondoesntsupportaltmode");
      }
    }

    const skillValue = skillItem.data.data.level;
    const skillName = skillItem.data.name;
    const skillMod = skillItem.data.data.skillmod;
    let cprRoll;
    let statName;
    if (weaponData.isRanged && this.data.data.weaponType !== "thrownWeapon") {
      statName = "ref";
    } else {
      statName = "dex";
    }

    const niceStatName = SystemUtils.Localize(`CPR.${statName}`);
    const statValue = actor.getStat(statName);

    switch (type) {
      case CPRRolls.rollTypes.AIMED: {
        cprRoll = new CPRRolls.CPRAimedAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
        break;
      }
      case CPRRolls.rollTypes.AUTOFIRE: {
        cprRoll = new CPRRolls.CPRAutofireRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
        break;
      }
      case CPRRolls.rollTypes.SUPPRESSIVE: {
        cprRoll = new CPRRolls.CPRSuppressiveFireRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
        break;
      }
      default:
        cprRoll = new CPRRolls.CPRAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
    }

    // apply known mods
    cprRoll.addMod(actor.getArmorPenaltyMods(statName));
    cprRoll.addMod(actor.getWoundStateMods());
    cprRoll.addMod(this._getMods());
    cprRoll.addMod(this._getAttackMod());
    cprRoll.addMod(skillMod);

    if (cprRoll instanceof CPRRolls.CPRAttackRoll && weaponData.isRanged) {
      Rules.lawyer(this.hasAmmo(cprRoll), "CPR.weaponattackoutofbullets");
    }
    return cprRoll;
  }

  createDamageRoll(type) {
    const rollName = this.data.name;
    const { weaponType } = this.data.data;
    let { damage } = this.data.data;
    if (weaponType === "unarmed" && this.data.data.unarmedAutomaticCalculation) {
      // calculate damage based on BODY stat
      const actorBodyStat = this.actor.data.data.stats.body.value;
      if (actorBodyStat <= 4) {
        if (this.data.data.hasCyberarm) {
          damage = "2d6";
        } else {
          damage = "1d6";
        }
      } else if (actorBodyStat <= 6) {
        damage = "2d6";
      } else if (actorBodyStat <= 10) {
        damage = "3d6";
      } else {
        damage = "4d6";
      }
    }
    const cprRoll = new CPRRolls.CPRDamageRoll(rollName, damage, weaponType);

    switch (type) {
      case CPRRolls.rollTypes.AIMED: {
        cprRoll.isAimed = true;
        break;
      }
      case CPRRolls.rollTypes.AUTOFIRE: {
        cprRoll.setAutofire();
        break;
      }
      default:
    }
    if (this.data.data.isRanged) {
      const ammoType = this._getLoadedAmmoType();
      if (ammoType !== "undefined") {
        cprRoll.rollCardExtraArgs.ammoType = ammoType;
      }
    }
    return cprRoll;
  }

  _getMods() {
    switch (this.type) {
      case "weapon": {
        if (this.data.data.quality === "excellent") {
          return 1;
        }
        break;
      }
      default:
    }
    return 0;
  }

  _getAttackMod() {
    switch (this.type) {
      case "weapon": {
        if (typeof this.data.data.attackmod !== "undefined") {
          return this.data.data.attackmod;
        }
        break;
      }
      default:
    }
    return 0;
  }

  _getSkillMod() {
    switch (this.type) {
      case "skill": {
        return this.data.data.skillmod;
      }
      default:
    }
    return 0;
  }
}
