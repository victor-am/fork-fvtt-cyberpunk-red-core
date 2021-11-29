/* global Item game getProperty */
import * as CPRRolls from "../rolls/cpr-rolls.js";
import LOGGER from "../utils/cpr-logger.js";
import LoadAmmoPrompt from "../dialog/cpr-load-ammo-prompt.js";
import Rules from "../utils/cpr-rules.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
import DvUtils from "../utils/cpr-dvUtils.js";

// Item mixins
import Consumeable from "./mixins/cpr-consumeable.js";
import Effects from "./mixins/cpr-effects.js";
import Equippable from "./mixins/cpr-equippable.js";
import Loadable from "./mixins/cpr-loadable.js";
import Physical from "./mixins/cpr-physical.js";
import Stackable from "./mixins/cpr-stackable.js";
// import Spawner from "./mixins/cpr-spawner.js";
// import Upgradeable from "./mixins/cpr-upgradeable.js";
import Virtual from "./mixins/cpr-virtual.js";
import Valuable from "./mixins/cpr-valuable.js";

/**
 * We extend the base Item object (document) provided by Foundry. All items in the system derive from it.
 * By itself, it is mostly useless and too generic to be used practically in game.
 *
 * @extends {Item}
 */
export default class CPRItem extends Item {
  /**
   * TODO: figure out what to do with this, hopefully not needed
   * TODO: this should figure out owned vs. not owned items too
   * @override
   * @param {Item} data - details/changes for the Item itself
   * @param {Object} options options (from Foundry) to the Item update process
   */
  update(data, options = {}) {
    LOGGER.trace("update | CPRItem | Called.");
    const cprData = data;
    if (data["data.type"] === "cyberwareInternal" || data["data.type"] === "cyberwareExternal" || data["data.type"] === "fashionware") {
      cprData["data.isFoundational"] = false;
    }
    if (this.data.type === "weapon") {
      cprData["data.dvTable"] = data["data.dvTable"] === null ? "" : data["data.dvTable"];
    }
    super.update(cprData, options);
  }

  /**
   * TODO: probably not needed after the new code
   * @param {Item} data - the primitive data for the Item being created
   * @param {Object} options - options (from Foundry) to the Item creation process
   * @param {String} userId - user ID that is creating the Item
   */
  _onCreate(data, options, userId) {
    LOGGER.trace("_onCreate | CPRItem | Called.");
    const newData = data;
    // If we are creating an upgradable item from an existing upgradable item
    // which has been upgraded, remove the upgrade from the new weapon as it
    // may reference an itemUpgrade object which doesn't exist in the same
    // location as the upgradable item
    const upgradableItemTypes = SystemUtils.GetTemplateItemTypes("upgradable");
    if (upgradableItemTypes.includes(data.type)) {
      newData.data.isUpgraded = false;
      newData.data.upgrades = [];
    }
    super._onCreate(newData, options, userId);
  }

  /**
   * Load all mixins configured in the Item metadata
   *
   * @public
   */
  loadMixins() {
    LOGGER.trace("loadMixins | CPRItem | Called.");
    const mixins = SystemUtils.getDataModelTemplates(this.type);
    const itemData = this.data;
    itemData.actions = ["delete"];
    for (let m = 0; m < mixins.length; m += 1) {
      switch (mixins[m]) {
        case "consumable": {
          Consumeable.call(CPRItem.prototype);
          itemData.actions.push("consume");
          break;
        }
        case "effects": {
          Effects.call(CPRItem.prototype);
          // To Do: we could toggle on/off if there's exactly 1 effect enforced...
          break;
        }
        case "equippable": {
          Equippable.call(CPRItem.prototype);
          itemData.actions.push("equip");
          break;
        }
        case "loadable": {
          Loadable.call(CPRItem.prototype);
          itemData.actions.push("reload");
          itemData.actions.push("changeAmmo");
          break;
        }
        case "physical": {
          Physical.call(CPRItem.prototype);
          itemData.actions.push("conceal");
          break;
        }
        case "spawner": {
          // Spawner.call(CPRItem.prototype);
          itemData.actions.push("rez");
          break;
        }
        case "stackable": {
          Stackable.call(CPRItem.prototype);
          itemData.actions.push("split");
          break;
        }
        case "upgradeable": {
          // Upgradeable.call(CPRItem.prototype);
          itemData.actions.push("upgrade");
          break;
        }
        case "valuable": {
          Valuable.call(CPRItem.prototype);
          break;
        }
        case "virtual": {
          Virtual.call(CPRItem.prototype);
          break;
        }
        default:
          LOGGER.warn(`Tried to load an unknown mixin, ${mixins[m]}`);
      }
      LOGGER.debug(`Added mixin ${mixins[m]} to ${this.id}`);
    }
  }

  /**
   * Whenever an item is created or updated this method is called by Foundry. We use it
   * to add in the "mixins" enabled for this item type.
   * This seems excessive (once on item creation seems enough) but this is what DND5E does.
   *
   * @override
   */
  prepareDerivedData() {
    LOGGER.trace("prepareDerivedData | CPRItem | Called.");
    super.prepareDerivedData();
    this.loadMixins();
  }

  /**
   * Generic item.doAction() method so any item can be called to
   * perform an action.  This can be easily extended in the
   * switch statement and adding additional methods for each item.
   * Prepatory work for
   * Click to Consume (Apply mods / effect / state change)
   * Opening Agent Dialog
   * Any calls to functions not related to rolls, triggered from actions.
   *
   * @param {Actor} actor - the actor (parent) associated with the item doing something
   * @param {*} actionAttributes - arbitrary data to control the action
   */
  doAction(actor, actionAttributes) {
    LOGGER.trace("doAction | CPRItem | Called.");
    const itemType = this.data.type;
    // const changedItems = [];
    switch (itemType) {
      case "cyberware": {
        this._cyberwareAction(actor, actionAttributes);
        break;
      }
      case "itemUpgrade": {
        this._itemUpgradeAction(actor, actionAttributes);
        break;
      }
      case "weapon": {
        this._weaponAction(actor, actionAttributes);
        break;
      }
      case "ammo": {
        this._ammoAction(actionAttributes);
        break;
      }
      default:
    }
  }

  _itemUpgradeAction(actor, actionAttributes) {
    LOGGER.trace("_itemUpgradeAction | CPRItem | Called.");
    switch (this.data.data.type) {
      case "weapon": {
        if (this.data.data.modifiers.secondaryWeapon.configured) {
          return this._weaponAction(actor, actionAttributes);
        }
        break;
      }
      default:
    }
    return null;
  }

  _cyberwareAction(actor, actionAttributes) {
    LOGGER.trace("_cyberwareAction | CPRItem | Called.");
    const actionData = actionAttributes["data-action"].nodeValue;
    switch (actionData) {
      case "select-ammo":
      case "unload":
      case "load":
      case "reload-ammo":
      case "measure-dv": {
        return this._weaponAction(actor, actionAttributes);
      }
      default:
    }
    return null;
  }

  confirmRoll(cprRoll) {
    LOGGER.trace("confirmRoll | CPRItem | Called.");
    const itemType = this.data.type;
    const localCprRoll = cprRoll;
    const actorData = this.actor.data;
    const itemEntities = game.system.template.Item;
    if (itemEntities[itemType].templates.includes("weapon")) {
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
    if (itemType === "role") {
      const subRoleAbility = this.data.data.abilities.find((a) => a.name === localCprRoll.roleName);
      let subRoleSkill;
      let isSubRoleAbility = false;
      let isVarying = false;
      if (typeof subRoleAbility !== "undefined") {
        isSubRoleAbility = true;
        subRoleSkill = subRoleAbility.skill;
      }
      if (!isSubRoleAbility && this.data.data.skill === "varying") {
        isVarying = true;
      } else if (isSubRoleAbility && subRoleSkill === "varying") {
        isVarying = true;
      }
      if (isVarying) {
        const roleSkill = actorData.filteredItems.skill.find((s) => s.data.name === localCprRoll.skillName);
        localCprRoll.skillValue = roleSkill.data.data.level + roleSkill.data.data.skillmod;
        if (localCprRoll.statName === "--") {
          localCprRoll.statName = roleSkill.data.data.stat;
          localCprRoll.statValue = this.actor.getStat(localCprRoll.statName);
        }
      }
    }
    return localCprRoll;
  }

  // AMMO FUNCTIONS
  _ammoAction(actionAttributes) {
    LOGGER.trace("_ammoAction | CPRItem | Called.");
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
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
  }

  async setCompatibleAmmo(ammoList) {
    LOGGER.trace("setCompatibleAmmo | CPRSkillItem | Called.");
    this.data.data.ammoVariety = ammoList;
    if (this.actor) {
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
    return this.update({ "data.ammoVariety": ammoList });
  }

  async _ammoDecrement(changeAmount) {
    LOGGER.trace("_ammoDecrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Math.max(0, Number(currentValue) - Number(changeAmount));
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
    return null;
  }

  async _ammoIncrement(changeAmount) {
    LOGGER.trace("_ammoIncrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Number(currentValue) + Number(changeAmount);
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
    return null;
  }

  // Weapon Item Methods
  async _weaponAction(actor, actionAttributes) {
    LOGGER.trace("_weaponAction | CPRItem | Called.");
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
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
  }

  static async _measureDv(actor, dvTable) {
    LOGGER.trace("_measureDv | CPRItem | Called.");
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
  }

  async _weaponUnload() {
    LOGGER.trace("_weaponUnload | CPRItem | Called.");
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
  }

  // The only time an ammo ID is passed to this is when it is being reloaded
  async _weaponLoad(reloadAmmoId) {
    LOGGER.trace("_weaponLoad | CPRItem | Called.");
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
    LOGGER.trace("hasAmmo | CPRItem | Called.");
    return (this.data.data.magazine.value - CPRItem.bulletConsumption(cprRoll)) >= 0;
  }

  setWeaponAmmo(value) {
    LOGGER.trace("setWeaponAmmo | CPRItem | Called.");
    const maxAmmo = this.getRollData().magazine.max;
    if (this.type === "weapon") {
      if (value.charAt(0) === "+" || value.charAt(0) === "-") {
        this.getRollData().magazine.value = Math.clamped(0, this.getRollData().magazine.value + parseInt(value, 10), maxAmmo);
      } else {
        this.getRollData().magazine.value = Math.clamped(0, value, maxAmmo);
      }
    }
  }

  // Returns true if weapon fired, otherwise returns false.
  fireRangedWeapon(cprRoll) {
    LOGGER.trace("fireRangedWeapon | CPRItem | Called.");
    const discharged = CPRItem.bulletConsumption(cprRoll);
    // don't go negative
    this.data.data.magazine.value = Math.max(this.data.data.magazine.value - discharged, 0);
    return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
  }

  _getLoadedAmmoType() {
    LOGGER.trace("_getLoadedAmmoType | CPRItem | Called.");
    if (this.actor) {
      const ammo = this.actor.items.find((i) => i.data._id === this.data.data.magazine.ammoId);
      if (ammo) {
        return ammo.data.data.type;
      }
    }
    return undefined;
  }

  toggleFavorite() {
    LOGGER.trace("toggleFavorite | CPRItem | Called.");
    this.update({ "data.favorite": !this.data.data.favorite });
  }

  createRoll(type, actor, extraData = []) {
    LOGGER.trace("createRoll | CPRItem | Called.");
    switch (type) {
      case CPRRolls.rollTypes.SKILL: {
        return this._createSkillRoll(actor);
      }
      case CPRRolls.rollTypes.INTERFACEABILITY:
      case CPRRolls.rollTypes.ROLEABILITY: {
        return this._createRoleRoll(type, actor, extraData);
      }
      case CPRRolls.rollTypes.SUPPRESSIVE:
      case CPRRolls.rollTypes.AUTOFIRE:
      case CPRRolls.rollTypes.AIMED:
      case CPRRolls.rollTypes.ATTACK: {
        return this._createAttackRoll(type, actor);
      }
      case CPRRolls.rollTypes.DAMAGE: {
        const damageType = extraData.damageType ? extraData.damageType : type;
        return this._createDamageRoll(damageType);
      }
      // case CPRRolls.rollTypes.INTERFACEABILITY:
      case CPRRolls.rollTypes.CYBERDECKPROGRAM: {
        return this._createCyberdeckRoll(type, actor, extraData);
      }
      default:
    }
    return null;
  }

  _createAttackRoll(type, actor) {
    LOGGER.trace("_createAttackRoll | CPRItem | Called.");
    const weaponData = this.data.data;
    const weaponName = this.name;
    const { weaponType } = weaponData;
    let skillItem = actor.items.find((i) => i.name === weaponData.weaponSkill);

    if (type === CPRRolls.rollTypes.SUPPRESSIVE || type === CPRRolls.rollTypes.AUTOFIRE) {
      skillItem = actor.items.find((i) => i.name === "Autofire");
      if (!this.data.data.fireModes.suppressiveFire) {
        if (this.data.data.weaponType !== "smg" && this.data.data.weaponType !== "heavySmg" && this.data.data.weaponType !== "assaultRifle") {
          Rules.lawyer(false, "CPR.messages.weaponDoesntSupportAltMode");
        }
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

    const niceStatName = SystemUtils.Localize(`CPR.global.stats.${statName}`);
    const statValue = actor.getStat(statName);
    let roleName;
    let roleValue = 0;
    actor.data.filteredItems.role.forEach((r, index1) => {
      const roleSkillBonuses = actor.data.filteredItems.role.filter((role) => role.data.data.bonuses.some((b) => b.name === skillName));
      if (roleSkillBonuses.length > 0 && index1 === 0) {
        roleSkillBonuses.forEach((b, index2) => {
          if (roleName) {
            roleName += `, ${b.data.data.mainRoleAbility}`;
          } else if (index2 === 0) {
            roleName = b.data.data.mainRoleAbility;
          }
          roleValue += Math.floor(b.data.data.rank / b.data.data.bonusRatio);
        });
      }
      const subroleSkillBonuses = r.data.data.abilities.filter((a) => a.bonuses.some((b) => b.name === skillName));
      if (subroleSkillBonuses.length > 0) {
        subroleSkillBonuses.forEach((b, index3) => {
          if (roleName) {
            roleName += `, ${b.name}`;
          } else if (index3 === 0) {
            roleName = b.name;
          }
          roleValue += Math.floor(b.rank / b.bonusRatio);
        });
      }
    });
    let universalBonusAttack = actor.data.data.universalBonuses.attack;
    this.actor.data.filteredItems.role.forEach((r) => {
      if (r.data.data.universalBonuses.includes("attack")) {
        universalBonusAttack += Math.floor(r.data.data.rank / r.data.data.bonusRatio);
      }
      const subroleUniversalBonuses = r.data.data.abilities.filter((a) => a.universalBonuses.includes("attack"));
      if (subroleUniversalBonuses.length > 0) {
        subroleUniversalBonuses.forEach((b) => {
          universalBonusAttack += Math.floor(b.rank / b.bonusRatio);
        });
      }
    });

    switch (type) {
      case CPRRolls.rollTypes.AIMED: {
        cprRoll = new CPRRolls.CPRAimedAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
        break;
      }
      case CPRRolls.rollTypes.AUTOFIRE: {
        cprRoll = new CPRRolls.CPRAutofireRoll(weaponName, niceStatName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
        break;
      }
      case CPRRolls.rollTypes.SUPPRESSIVE: {
        cprRoll = new CPRRolls.CPRSuppressiveFireRoll(weaponName, niceStatName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
        break;
      }
      default:
        cprRoll = new CPRRolls.CPRAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, roleName, roleValue, weaponType, universalBonusAttack);
    }

    // apply known mods
    cprRoll.addMod(actor.getArmorPenaltyMods(statName));
    cprRoll.addMod(actor.getWoundStateMods());
    cprRoll.addMod(this._getMods());
    cprRoll.addMod(this._getAttackMod());
    cprRoll.addMod(skillMod);

    if (cprRoll instanceof CPRRolls.CPRAttackRoll && weaponData.isRanged) {
      Rules.lawyer(this.hasAmmo(cprRoll), "CPR.messages.weaponAttackOutOfBullets");
    }
    return cprRoll;
  }

  _createDamageRoll(type) {
    LOGGER.trace("_createDamageRoll | CPRItem | Called.");
    const rollName = this.data.name;
    const { weaponType } = this.data.data;
    let { damage } = this.data.data;
    let universalBonusDamage = this.actor.data.data.universalBonuses.damage;
    if ((weaponType === "unarmed" || weaponType === "martialArts") && this.data.data.unarmedAutomaticCalculation) {
      // calculate damage based on BODY stat
      const actorBodyStat = this.actor.data.data.stats.body.value;
      if (actorBodyStat <= 4) {
        if (weaponType === "unarmed" && this.actor.data.filteredItems.cyberware.some((c) => (
          (c.data.data.type === "cyberArm") && (c.data.data.isInstalled === true) && (c.data.data.isFoundational === true)))) {
          // If the user has an installed Cyberarm, which is a foundational. This is only for unarmed damage, not martial arts damage.
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
    this.actor.data.filteredItems.role.forEach((r) => {
      if (r.data.data.universalBonuses.includes("damage")) {
        universalBonusDamage += Math.floor(r.data.data.rank / r.data.data.bonusRatio);
      }
      const subroleUniversalBonuses = r.data.data.abilities.filter((a) => a.universalBonuses.includes("damage"));
      if (subroleUniversalBonuses.length > 0) {
        subroleUniversalBonuses.forEach((b) => {
          universalBonusDamage += Math.floor(b.rank / b.bonusRatio);
        });
      }
    });
    const cprRoll = new CPRRolls.CPRDamageRoll(rollName, damage, weaponType, universalBonusDamage);

    if (this.data.data.fireModes.autoFire === 0 && (
      (this.data.data.weaponType === "smg" || this.data.data.weaponType === "heavySmg" || this.data.data.weaponType === "assaultRifle"))) {
      this.data.data.fireModes.autoFire = this.data.data.weaponType === "assaultRifle" ? 4 : 3;
    }

    cprRoll.configureAutofire(1, this.data.data.fireModes.autoFire);

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
    const halfArmorAttacks = [
      "lightMelee",
      "medMelee",
      "heavyMelee",
      "vHeavyMelee",
      "martialArts",
    ];
    if (halfArmorAttacks.includes(weaponType)) {
      cprRoll.rollCardExtraArgs.ignoreHalfArmor = true;
    }
    const upgradeType = this.getUpgradeTypeFor("damage");
    const upgradeValue = this.getAllUpgradesFor("damage");
    if (upgradeType === "override") {
      cprRoll.formula = "0d6";
    }
    cprRoll.addMod(upgradeValue);

    return cprRoll;
  }

  _getMods() {
    LOGGER.trace("_getMods | CPRItem | Called.");
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
    LOGGER.trace("_getAttackMod | CPRItem | Called.");
    let returnValue = 0;
    switch (this.type) {
      case "weapon": {
        if (typeof this.data.data.attackmod !== "undefined") {
          returnValue = this.data.data.attackmod;
        }
        break;
      }
      default:
    }
    const upgradeValue = this.getAllUpgradesFor("attackmod");
    const upgradeType = this.getUpgradeTypeFor("attackmod");
    returnValue = (upgradeType === "override") ? upgradeValue : returnValue + upgradeValue;
    return returnValue;
  }
}
