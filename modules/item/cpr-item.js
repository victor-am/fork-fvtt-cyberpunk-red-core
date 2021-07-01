/* eslint-disable no-undef */
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
    LOGGER.trace(`prepareData | CPRItem | Called for type: ${this.type}.`);
    super.prepareData();
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
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
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
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
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
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
    }
  }

  async _ammoIncrement(changeAmount) {
    LOGGER.debug("_ammoIncrement | CPRItem | Called.");
    const currentValue = this.data.data.amount;
    const newValue = Number(currentValue) + Number(changeAmount);
    this.data.data.amount = newValue;
    if (this.actor) {
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
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
      this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
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
      return this.actor.updateEmbeddedDocuments("Item", [{ _id: this.id, data: this.data.data }]);
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
          SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.ammomissingfromgear")));
          return;
        }

        if (ammo.getData().amount === 0) {
          SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.reloadoutofammo")));
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

  setItemAmount(value) {
    LOGGER.debug("setItemAmount | CPRItem | Called.");
    if (value.charAt(0) === "+" || value.charAt(0) === "-") {
      this.getData().amount = this.getData().amount + parseInt(value, 10);
    } else {
      this.getData().amount = parseInt(value, 10);
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
    this.update({ "data.favorite": !this.data.data.favorite });
  }

  createRoll(type, actor, extraData = []) {
    LOGGER.trace("createRoll | CPRItem | Called.");
    switch (type) {
      case CPRRolls.rollTypes.SKILL: {
        return this._createSkillRoll(actor);
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
      case CPRRolls.rollTypes.INTERFACEABILITY:
      case CPRRolls.rollTypes.CYBERDECKPROGRAM: {
        return this._createCyberdeckRoll(type, actor, extraData);
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
          Rules.lawyer(false, "CPR.weapondoesntsupportaltmode");
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

  _createDamageRoll(type) {
    const rollName = this.data.name;
    const { weaponType } = this.data.data;
    let { damage } = this.data.data;
    if (weaponType === "unarmed" && this.data.data.unarmedAutomaticCalculation) {
      // calculate damage based on BODY stat
      const actorBodyStat = this.actor.data.data.stats.body.value;
      if (actorBodyStat <= 4) {
        if (this.actor.data.filteredItems.cyberware.some((c) => ((c.data.data.type === "cyberArm") && (c.data.data.isInstalled === true) && (c.data.data.isFoundational === true)))) {
          // If the user has an installed Cyberarm, which is a foundational
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

    if (this.data.data.fireModes.autoFire === 0 && ((this.data.data.weaponType === "smg" || this.data.data.weaponType === "heavySmg" || this.data.data.weaponType === "assaultRifle"))) {
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
    const upgradeType = this.getUpgradeTypeFor("damage");
    const upgradeValue = this.getAllUpgradesFor("damage");
    if (upgradeType === "override") {
      cprRoll.formula = "0d6";
    }
    cprRoll.addMod(upgradeValue);

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
    returnValue += this.getAllUpgradesFor("attackmod");
    return returnValue;
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

  /**
   * Program Code
   *
   * The methods below apply to the CPRItem.type = "program"
  */

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  setInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = true;
  }

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  unsetInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = false;
  }

  /**
   * Returns a boolean if the program is installed.
   *
   * @public
   */
  getInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    return this.data.data.isInstalled;
  }

  /**
   * Cyberdeck Code
   *
   * The methods below apply to the CPRItem.type = "cyberdeck"
  */

  /**
   * Dynamically calculates the number of free slots on the Cyberdeck
   * by starting with the number of slots this cyberdeck has and substacting
   * the slot size of each of the installed programs.
   *
   * @public
   */
  availableSlots() {
    LOGGER.debug("availableSlots | CPRItem | Called.");
    const itemData = duplicate(this.data.data);

    let unusedSlots = 0;

    switch (this.data.type) {
      case "cyberdeck": {
        unusedSlots = itemData.slots;
        itemData.programs.installed.forEach((program) => {
          unusedSlots -= program.data.slots;
        });
        break;
      }
      case "weapon": {
        unusedSlots = itemData.attachmentSlots;
        itemData.upgrades.forEach((mod) => {
          unusedSlots -= mod.data.size;
        });
        break;
      }
      default:
    }

    return unusedSlots;
  }

  /**
   * Returns a list of installed programs.  This is a list of ItemData as the
   * Item itself is not stored because Items can't own Items. As such, if you
   * are looking for a specific program, each Array entry has a entry._id of
   * the Object it represents.
   *
   * @public
   */
  getInstalledPrograms() {
    LOGGER.debug("getInstalledPrograms | CPRItem | Called.");
    return this.data.data.programs.installed;
  }

  /**
   * Returns a list of rezzed programs.  This is a list of ItemData as the
   * Item itself is not stored because Items can't own Items. As such, if you
   * are looking for a specific program, each Array entry has a entry._id of
   * the Object it represents.
   *
   * @public
   */
  getRezzedPrograms() {
    LOGGER.debug("getRezzedPrograms | CPRItem | Called.");
    return this.data.data.programs.rezzed;
  }

  /**
   * Install programs from the Cyberdeck
   *
   * @public
   * @param {Array} programs      - Array of CPRItem programs
   */
  installPrograms(programs) {
    LOGGER.debug("installProgram | CPRItem | Called.");
    const { installed } = this.data.data.programs;
    programs.forEach((p) => {
      const onDeck = installed.filter((iProgram) => iProgram._id === p.data._id);
      if (onDeck.length === 0) {
        const programInstallation = p.data;
        programInstallation.data.isRezzed = false;
        installed.push(programInstallation);
        p.setInstalled();
      }
    });
    this.data.data.programs.installed = installed;
  }

  /**
   * Uninstall programs from the Cyberdeck
   *
   * @public
   * @param {Array} programs      - Array of CPRItem programs
   */
  uninstallPrograms(programs) {
    LOGGER.debug("uninstallPrograms | CPRItem | Called.");
    let { rezzed } = this.data.data.programs;
    let { installed } = this.data.data.programs;
    const tokenList = [];
    let sceneId;
    programs.forEach(async (program) => {
      if (program.data.data.class === "blackice" && this.isRezzed(program)) {
        const rezzedIndex = this.data.data.programs.rezzed.findIndex((p) => p._id === program.id);
        const programData = this.data.data.programs.rezzed[rezzedIndex];
        const cprFlags = programData.flags["cyberpunk-red-core"];
        if (cprFlags.biTokenId) {
          tokenList.push(cprFlags.biTokenId);
        }
        if (cprFlags.sceneId) {
          sceneId = cprFlags.sceneId;
        }
      }
      installed = installed.filter((p) => p._id !== program.id);
      rezzed = rezzed.filter((p) => p._id !== program.id);
      if ((typeof program.unsetInstalled === "function")) {
        program.unsetInstalled();
      }
    });
    this.data.data.programs.installed = installed;
    this.data.data.programs.rezzed = rezzed;

    if (tokenList.length > 0 && sceneId) {
      const sceneList = game.scenes.filter((s) => s.id === sceneId);
      if (sceneList.length === 1) {
        const [scene] = sceneList;
        return scene.deleteEmbeddedDocuments("Token", tokenList);
      }
    }
  }

  /**
   * Return true/false if the program is Rezzed
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program to check
   */
  isRezzed(program) {
    LOGGER.debug("isRezzed | CPRItem | Called.");
    const rezzedPrograms = this.data.data.programs.rezzed.filter((p) => p._id === program.id);
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === program.data._id);
    const programState = installed[installIndex];
    programState.data.isRezzed = (rezzedPrograms.length > 0);
    installed[installIndex] = programState;
    this.data.data.programs.installed = installed;
    program.data.isRezzed = (rezzedPrograms.length > 0);
    return (rezzedPrograms.length > 0);
  }

  /**
   * Rez a program by setting the isRezzed boolean on the program to true
   * and push the program onto the rezzed array of the Cyberdeck
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program to REZ
   */
  async rezProgram(program, callingToken) {
    LOGGER.debug("rezProgram | CPRItem | Called.");
    const programData = duplicate(program.data);
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === programData._id);
    const programState = installed[installIndex];
    // This instance ID is being added pro-actively because the rulebook
    // is a bit fuzzy on the bottom of Page 201 with regards to rezzing the
    // same program multiple times.  The rulebook says:
    // "You can run multiple copies of the same Program on your Cyberdeck"
    // however when I asked on the Discord, I was told you can not do this,
    // you have to install a program twice on the Cyberdeck if you want to
    // rez it twice.  So the code here supports what was told to me in Discord.
    // If it ever comes back that a single install of a program can be run
    // multiple times, we will already have a an instance ID to differentiate
    // the different rezzes.
    const rezzedInstance = randomID();
    program.setFlag("cyberpunk-red-core", "rezInstanceId", rezzedInstance);
    programState.data.isRezzed = true;
    installed[installIndex] = programState;
    if (programData.data.class === "blackice") {
      await this._rezBlackIceToken(programData, callingToken);
    }
    this.data.data.programs.installed = installed;
    this.data.data.programs.rezzed.push(programData);
  }

  /**
   * Create a Black ICE Token on the active scene as it was just rezzed
   *
   * @private
   * @param {CPRItem} program      - CPRItem of the program create the Token for
   */
  async _rezBlackIceToken(programData, callingToken) {
    LOGGER.debug("_rezBlackIceToken | CPRItem | Called.");
    let netrunnerToken = callingToken;
    let scene;
    const blackIceName = programData.name;

    if (!netrunnerToken && this.actor.isToken) {
      netrunnerToken = this.actor.token;
    }

    if (!netrunnerToken) {
      // Search for a token associated with this Actor ID.
      const tokenList = game.scenes.map((tokenDoc) => tokenDoc.tokens.filter((t) => t.id === this.actor.id)).filter((s) => s.length > 0);
      if (tokenList.length === 1) {
        [netrunnerToken] = tokenList;
      } else {
        LOGGER.error(`_rezBlackIceToken | CPRItem | Attempting to create a Black ICE Token failed because we were unable to find a Token associated with World Actor "${this.actor.name}".`);
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.rezbiwithouttoken"));
        return;
      }
    }

    if (netrunnerToken.isEmbedded && netrunnerToken.parent instanceof Scene) {
      scene = netrunnerToken.parent;
    } else {
      LOGGER.error(`_rezBlackIceToken | CPRItem | Attempting to create a Black ICE Token failed because the token does not appear to be part of a scene.`);
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.rezbiwithoutscene"));
      return;
    }

    // First, let's see if an Actor exists that is a blackIce Actor with the same name, if so, we will use that
    // to model the token Actor Data.
    const blackIceActors = game.actors.filter((bi) => bi.type === "blackIce" && bi.name === blackIceName);
    let blackIce;
    if (blackIceActors.length === 0) {
      try {
        // We didn't find a blackIce Actor with a matching name so we need to create one dynamically.
        // We will keep all auto-generated Actors in a Folder called CPR Autogenerated to ensure the Actors
        // list of the user stays clean.
        const dynamicFolderName = "CPR Autogenerated";
        const dynamicFolder = await SystemUtils.GetFolder("Actor", dynamicFolderName);
        // Create a new Black ICE Actor
        blackIce = await Actor.create({
          name: blackIceName,
          type: "blackIce",
          folder: dynamicFolder,
          img: "systems/cyberpunk-red-core/icons/netrunning/Black_Ice.png",
        });
        // Configure the Actor based on the Black ICE Program Stats.
        blackIce.programmaticallyUpdate(programData.data.blackIceType, programData.data.per, programData.data.spd, programData.data.atk, programData.data.def, programData.data.rez, programData.data.rez, programData.data.description.value);
      } catch (error) {
        LOGGER.error(`_rezBlackIceToken | CPRItem | Attempting to create a Black ICE Actor failed. Error: ${error}`);
        return;
      }
    } else {
      // We found a matching Actor so we will use that to model our Token Data
      [blackIce] = blackIceActors;
    }

    const tokenFlags = {
      netrunnerTokenId: netrunnerToken.id,
      sourceCyberdeckId: this.id,
      programId: programData._id,
      sceneId: scene.id,
    };
    const tokenData = [{
      name: blackIce.name,
      actorId: blackIce.data._id,
      actorData: blackIce.data,
      actorLink: false,
      img: blackIce.img,
      x: netrunnerToken.data.x + 75,
      y: netrunnerToken.data.y,
      flags: { "cyberpunk-red-core": tokenFlags },
    }];
    try {
      const biTokenList = await scene.createEmbeddedDocuments("Token", tokenData);
      const biToken = (biTokenList.length > 0) ? biTokenList[0] : null;
      if (biToken !== null) {
        // Update the Token Actor based on the Black ICE Program Stats, leaving any effect description in place.
        biToken.actor.programmaticallyUpdate(programData.data.blackIceType, programData.data.per, programData.data.spd, programData.data.atk, programData.data.def, programData.data.rez, programData.data.rez);
        const cprFlags = (typeof programData.flags["cyberpunk-red-core"] !== "undefined") ? programData.flags["cyberpunk-red-core"] : {};
        cprFlags.biTokenId = biToken.id;
        cprFlags.sceneId = scene.id;
        programData.flags["cyberpunk-red-core"] = cprFlags;
      }
    } catch (error) {
      LOGGER.error(`_rezBlackIceToken | CPRItem | Attempting to create a Black ICE Token failed. Error: ${error}`);
    }
  }

  /**
   * Remove a program from the rezzed list on the Cyberdeck
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program de-rez
   */
  async derezProgram(program) {
    LOGGER.debug("derezProgram | CPRItem | Called.");
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === program.id);
    const programState = installed[installIndex];
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === program.id);
    const programData = rezzed[rezzedIndex];
    programState.data.isRezzed = false;
    installed[installIndex] = programState;
    if (program.data.data.class === "blackice") {
      await this._derezBlackIceToken(programData);
    }
    const newRezzed = this.data.data.programs.rezzed.filter((p) => p._id !== program.id);
    this.data.data.programs.rezzed = newRezzed;
  }

  /**
   * Remove a Black ICE Token from the game as it is de-rezzed
   *
   * @private
   * @param {CPRItem} program      - CPRItem of the program to remove the token for
   */
  async _derezBlackIceToken(programData) {
    LOGGER.debug("_derezBlackIceToken | CPRItem | Called.");
    if (typeof programData.flags["cyberpunk-red-core"] !== "undefined") {
      const cprFlags = programData.flags["cyberpunk-red-core"];
      const { biTokenId } = cprFlags;
      const { sceneId } = cprFlags;
      if (typeof biTokenId !== "undefined" && typeof sceneId !== "undefined") {
        const sceneList = game.scenes.filter((s) => s.id === sceneId);
        if (sceneList.length === 1) {
          const [scene] = sceneList;
          const tokenList = scene.tokens.filter((t) => t.id === biTokenId);
          if (tokenList.length === 1) {
            await scene.deleteEmbeddedDocuments("Token", [biTokenId]);
          } else {
            LOGGER.warn(`_derezBlackIceToken | CPRItem | Unable to find biTokenId (${biTokenId}) in scene ${scene.name} (${scene.id}). May have been already deleted.`);
          }
        } else {
          LOGGER.error(`_derezBlackIceToken | CPRItem | Unable to locate sceneId ${scene.id}`);
        }
      } else {
        LOGGER.error(`_derezBlackIceToken | CPRItem | Unable to retrieve biTokenId and sceneId from programData: ${programData.name} (${programData._id})`);
      }
    } else {
      LOGGER.error(`_derezBlackIceToken | CPRItem | No flags found in programData.`);
    }
  }

  /**
   * Reset a rezzed program numbers to be that of the installed version of the program
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program to reset
   */
  resetRezProgram(program) {
    LOGGER.debug("resetRezProgram | CPRItem | Called.");
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === program.id);
    const { installed } = this.data.data.programs;
    const installedIndex = installed.findIndex((p) => p._id === program.id);
    this.data.data.programs.rezzed[rezzedIndex] = this.data.data.programs.installed[installedIndex];
  }

  /**
   * Reduce the rezzed value of a rezzed program.
   *
   * @public
   * @param {CPRItem} program     - The program to reduce the REZ of
   * @param {Number} reduceAmount - Amount to reduce REZ by. Defaults to 1.
   */
  reduceRezProgram(program, reduceAmount = 1) {
    LOGGER.debug("reduceRezProgram | CPRItem | Called.");
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === program.id);
    const programState = rezzed[rezzedIndex];
    const newRez = Math.max(programState.data.rez - reduceAmount, 0);
    programState.data.rez = newRez;
    this.data.data.programs.rezzed[rezzedIndex] = programState;
    if (programState.data.class === "blackice" && typeof programState.flags["cyberpunk-red-core"] !== "undefined") {
      const cprFlags = programState.flags["cyberpunk-red-core"];
      if (typeof cprFlags.biTokenId !== "undefined") {
        const { biTokenId } = cprFlags;
        const tokenList = canvas.scene.tokens.map((tokenDoc) => tokenDoc.actor.token).filter((token) => token).filter((t) => t.id === biTokenId);
        if (tokenList.length === 1) {
          const [biToken] = tokenList;
          biToken.actor.programmaticallyUpdate(programState.data.blackIceType, programState.data.per, programState.data.spd, programState.data.atk, programState.data.def, programState.data.rez);
        }
      }
    }
  }

  updateRezzedProgram(programId, updatedData) {
    LOGGER.debug("updateRezProgram | CPRItem | Called.");
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === programId);
    const programState = rezzed[rezzedIndex];
    const dataPoints = Object.keys(updatedData);
    dataPoints.forEach((attribute) => {
      switch (attribute) {
        case "per":
        case "spd":
        case "atk":
        case "def": {
          programState.data[attribute] = updatedData[attribute];
          break;
        }
        case "rez": {
          programState.data.rez = updatedData.rez.value;
          break;
        }
        default:
      }
    });
  }

  /**
   * Get total modifiers for a specified boosterType from the programs rezzed on the Cyberdeck.
   *
   * @public
   * @param {String} boosterType - string defining the type of boosters to return.
   */
  getBoosters(boosterType) {
    LOGGER.debug("getBoosters | CPRItem | Called.");
    const { rezzed } = this.data.data.programs;
    let modifierTotal = 0;
    switch (boosterType) {
      case "attack": {
        rezzed.forEach((program) => {
          if (typeof program.data.atk === "number" && program.data.class !== "blackice") {
            modifierTotal += program.data.atk;
          }
        });
        break;
      }
      case "defense": {
        rezzed.forEach((program) => {
          if (typeof program.data.def === "number" && program.data.class !== "blackice") {
            modifierTotal += program.data.def;
          }
        });
        break;
      }
      default: {
        rezzed.forEach((program) => {
          if (program.data.modifiers[boosterType] && program.data.class !== "blackice") {
            modifierTotal += program.data.modifiers[boosterType];
          }
        });
      }
    }
    return modifierTotal;
  }

  _createCyberdeckRoll(rollType, actor, extraData = {}) {
    LOGGER.debug("_createCyberdeckRoll | CPRItem | Called.");
    let rollTitle = "";
    let rollModifiers = 0;
    let cprRoll;
    switch (rollType) {
      case CPRRolls.rollTypes.INTERFACEABILITY: {
        const { interfaceAbility } = extraData;
        switch (interfaceAbility) {
          case "speed": {
            rollTitle = SystemUtils.Localize("CPR.speed");
            break;
          }
          case "defense": {
            rollTitle = SystemUtils.Localize("CPR.defense");
            break;
          }
          default: {
            rollTitle = SystemUtils.Localize(CPR.interfaceAbilities[interfaceAbility]);
          }
        }

        rollModifiers = this.getBoosters(interfaceAbility);
        cprRoll = actor.createRoll("roleAbility", "interface");
        cprRoll.setNetCombat(rollTitle);
        break;
      }
      case CPRRolls.rollTypes.CYBERDECKPROGRAM: {
        const { programId } = extraData;
        const programList = this.getInstalledPrograms().filter((iProgram) => iProgram._id === programId);
        let program = (programList.length > 0) ? programList[0] : null;
        let damageFormula = (program === null) ? "1d6" : program.data.damage.standard;
        if (program.data.class === "blackice") {
          const rezzedList = this.getRezzedPrograms().filter((rProgram) => rProgram._id === programId);
          program = (rezzedList.length > 0) ? rezzedList[0] : null;
          if (program.data.blackIceType === "antiprogram") {
            damageFormula = program.data.damage.blackIce;
          }
        }
        if (program === null) {
          LOGGER.error(`_createCyberdeckRoll | CPRItem | Unable to locate program ${programId}.`);
          return CPRRolls.CPRRoll("Unknown Program", "1d10");
        }
        const interfaceValue = (program.data.class === "blackice") ? 0 : extraData.interfaceValue;
        const skillName = (program.data.class === "blackice") ? "Black ICE" : "Interface";
        const atkValue = (program === null) ? 0 : program.data.atk;
        const pgmName = (program === null) ? "Program" : program.name;
        const { executionType } = extraData;
        rollModifiers = (program.data.class === "blackice") ? 0 : this.getBoosters(executionType);
        switch (executionType) {
          case "atk":
          case "def": {
            const niceName = executionType.toUpperCase();
            cprRoll = (program.data.class === "blackice") ? new CPRRolls.CPRStatRoll(niceName, program.data[executionType]) : new CPRRolls.CPRAttackRoll(pgmName, niceName, atkValue, skillName, interfaceValue, "program");
            cprRoll.rollCardExtraArgs.program = program;
            break;
          }
          case "damage": {
            cprRoll = new CPRRolls.CPRDamageRoll(program.name, damageFormula, "program");
            cprRoll.rollCardExtraArgs.pgmClass = program.data.class;
            cprRoll.rollCardExtraArgs.pgmDamage = program.data.damage;
            cprRoll.rollCardExtraArgs.program = program;
            break;
          }
          default:
        }
        cprRoll.setNetCombat(pgmName);
        break;
      }
      default:
    }
    cprRoll.addMod(rollModifiers);
    return cprRoll;
  }

  /** itemUpgrade Code */
  uninstallUpgrades(upgrades) {
    let installedUpgrades = this.data.data.upgrades;
    const updateList = [];
    upgrades.forEach((u) => {
      installedUpgrades = installedUpgrades.filter((iUpgrade) => iUpgrade._id !== u.id);
      updateList.push({ _id: u.id, "data.isInstalled": false });
    });
    const upgradeStaus = (installedUpgrades.length > 0);
    updateList.push({ _id: this.id, "data.isUpgraded": upgradeStaus, "data.upgrades": installedUpgrades });
    return this.actor.updateEmbeddedDocuments("Item", updateList);
  }

  installUpgrades(upgrades) {
    if (typeof this.data.data.isUpgraded === "boolean") {
      const installedUpgrades = this.data.data.upgrades;
      const updateList = [];
      upgrades.forEach((u) => {
        const alreadyInstalled = installedUpgrades.filter((iUpgrade) => iUpgrade._id === u.data._id);
        if (alreadyInstalled.length === 0) {
          updateList.push({ _id: u.id, "data.isInstalled": true });
          const modList = {};
          const upgradeModifiers = u.data.data.modifiers;
          Object.keys(upgradeModifiers).forEach((index) => {
            const modifier = upgradeModifiers[index];
            /*
              Before we add this modifier to the list of upgrades for this item, we need to do several checks:
              1. Ensure the modifier is defined as the key could have been added but the value never set
              2. Ensure the modifier is valid for this item type. As this information is stored in an
                 object, it's possible keys may exist that are not valid if one changes the itemUpgrade type.
              3. The next couple checks ensure we are only adding actual modifications, null, 0 or empty strings don't modify
                 anything, so we ignore those.
            */
            if (typeof modifier !== "undefined" && typeof CPR.upgradableDataPoints[this.type][index] !== "undefined" && modifier !== 0 && modifier !== null && modifier !== "") {
              modList[index] = modifier;
            }
          });
          const upgradeData = {
            _id: u._id,
            name: u.name,
            data: {
              modifiers: modList,
              size: u.data.data.size,
            },
          };
          installedUpgrades.push(upgradeData);
        }
      });
      updateList.push({ _id: this.id, "data.isUpgraded": true, "data.upgrades": installedUpgrades });
      return this.actor.updateEmbeddedDocuments("Item", updateList);
    }
  }

  getUpgradeTypeFor(dataPoint) {
    let upgradeType = "modifier";
    if (this.actor && typeof this.data.data.isUpgraded === "boolean" && this.data.data.isUpgraded) {
      const installedUpgrades = this.data.data.upgrades;
      installedUpgrades.forEach((upgrade) => {
        const modType = upgrade.data.modifiers[dataPoint].type;
        if (modType !== "modifier") {
          upgradeType = modType;
        }
      });
      return upgradeType;
    }
  }

  getAllUpgradesFor(dataPoint) {
    let upgradeNumber = 0;
    let baseOverride = 0;
    if (this.actor && typeof this.data.data.isUpgraded === "boolean" && this.data.data.isUpgraded) {
      const installedUpgrades = this.data.data.upgrades;
      installedUpgrades.forEach((upgrade) => {
        const modType = upgrade.data.modifiers[dataPoint].type;
        const modValue = upgrade.data.modifiers[dataPoint].value;
        if (typeof modValue === "number") {
          if (modType === "override") {
            baseOverride = (modValue > baseOverride) ? modValue : baseOverride;
          } else {
            upgradeNumber += modValue;
          }
        }
      });
      upgradeNumber = (baseOverride === 0) ? upgradeNumber : baseOverride;
    }
    return upgradeNumber;
  }
}
