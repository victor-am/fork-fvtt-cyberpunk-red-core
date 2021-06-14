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

  // Program Code
  setInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = true;
  }

  unsetInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = false;
  }

  getInstalled() {
    LOGGER.debug("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    return this.data.data.isInstalled;
  }

  // Cyberdeck Code
  availableSlots() {
    LOGGER.debug("availableSlots | CPRItem | Called.");
    if (this.data.type !== "cyberdeck") {
      return;
    }
    const itemData = duplicate(this.data.data);

    let unusedSlots = itemData.slots;

    itemData.programs.installed.forEach((program) => {
      unusedSlots -= program.data.slots;
    });

    return unusedSlots;
  }

  getInstalledPrograms() {
    LOGGER.debug("getInstalledPrograms | CPRItem | Called.");
    return this.data.data.programs.installed;
  }

  getRezzedPrograms() {
    LOGGER.debug("getRezzedPrograms | CPRItem | Called.");
    return this.data.data.programs.rezzed;
  }

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

  uninstallPrograms(programs) {
    let { rezzed } = this.data.data.programs;
    let { installed } = this.data.data.programs;
    programs.forEach((program) => {
      rezzed = rezzed.filter((p) => p._id !== program.id);
      installed = installed.filter((p) => p._id !== program.id);
      if ((typeof program.unsetInstalled === "function")) {
        program.unsetInstalled();
      }
    });
    this.data.data.programs.rezzed = rezzed;
    this.data.data.programs.installed = installed;
  }

  isRezzed(program) {
    const rezzedPrograms = this.data.data.programs.rezzed.filter((p) => p._id === program.id);
    return (rezzedPrograms.length > 0);
  }

  rezProgram(program) {
    const programData = program.data;
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
    programState.data.isRezzed = true;
    programData.data.rezInstanceId = rezzedInstance;
    installed[installIndex] = programState;
    this.data.data.programs.installed = installed;
    this.data.data.programs.rezzed.push(programData);
  }

  derezProgram(program) {
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === program.id);
    const programState = installed[installIndex];
    programState.data.isRezzed = false;
    installed[installIndex] = programState;
    const rezzed = this.data.data.programs.rezzed.filter((p) => p._id !== program.id);
    this.data.data.programs.rezzed = rezzed;
  }

  resetRezProgram(program) {
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === program.id);
    const { installed } = this.data.data.programs;
    const installedIndex = installed.findIndex((p) => p._id === program.id);
    this.data.data.programs.rezzed[rezzedIndex] = this.data.data.programs.installed[installedIndex];
  }

  reduceRezProgram(program) {
    const { rezzed } = this.data.data.programs;
    const rezzedIndex = rezzed.findIndex((p) => p._id === program.id);
    const programState = rezzed[rezzedIndex];
    const newRez = Math.max(programState.data.rez - 1, 0);
    programState.data.rez = newRez;
    this.data.data.programs.rezzed[rezzedIndex] = programState;
  }

  /**
   * Get total modifiers for a specified boosterType from the programs rezzed on the Cyberdeck.
   *
   * @public
   * @param {String} boosterType - string defining the type of boosters to return.
   */
  getBoosters(boosterType) {
    const { rezzed } = this.data.data.programs;
    let modifierTotal = 0;
    switch (boosterType) {
      case "attack": {
        rezzed.forEach((program) => {
          if (typeof program.data.atk === "number") {
            modifierTotal += program.data.atk;
          }
        });
        break;
      }
      case "defense": {
        rezzed.forEach((program) => {
          if (typeof program.data.def === "number") {
            modifierTotal += program.data.def;
          }
        });
        break;
      }
      default: {
        rezzed.forEach((program) => {
          if (program.data.modifiers[boosterType]) {
            modifierTotal += program.data.modifiers[boosterType];
          }
        });
      }
    }
    return modifierTotal;
  }

  _createCyberdeckRoll(rollType, actor, extraData = {}) {
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
        const programList = this.getInstalledPrograms().filter((program) => program._id === programId);
        const program = (programList.length > 0) ? programList[0] : null;
        const atkValue = (program === null) ? 0 : program.data.atk;
        const pgmName = (program === null) ? "Program" : program.name;
        const { executionType } = extraData;
        rollModifiers = this.getBoosters(executionType);
        switch (executionType) {
          case "attack": {
            cprRoll = new CPRRolls.CPRAttackRoll(pgmName, pgmName, atkValue, "Interface", extraData.interfaceValue, "program");
            break;
          }
          case "damage": {
            cprRoll = new CPRRolls.CPRDamageRoll(program.name, program.data.damage.standard, "program");
            cprRoll.rollCardExtraArgs.pgmClass = program.data.class;
            cprRoll.rollCardExtraArgs.pgmDamage = program.data.damage;
            cprRoll.rollCardExtraArgs.program = program;
            break;
          }
          default:
        }
        cprRoll.setNetCombat();
        break;
      }
      default:
    }
    cprRoll.addMod(rollModifiers);
    return cprRoll;
  }
}
