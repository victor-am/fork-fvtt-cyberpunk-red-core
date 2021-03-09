/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* global ActorSheet */
/* global mergeObject, $, setProperty game */
/* eslint no-prototype-builtins: ["warn"] */
import LOGGER from "../../utils/cpr-logger.js";
import * as CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import VerifyRoll from "../../dialog/cpr-verify-roll-prompt.js";
import Rules from "../../utils/cpr-rules.js";
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import SelectRolePrompt from "../../dialog/cpr-select-role-prompt.js";
import SetLifepathPrompt from "../../dialog/cpr-set-lifepath-prompt.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the basic ActorSheet.
 * @extends {ActorSheet}
 */
export default class CPRActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("ActorID defaultOptions | CPRActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(["sheet", "actor"]),
      width: 800,
      height: 540,
      scrollY: [".right-content-section"],
      collapsedSections: [],
    });
  }

  async _render(force = false, options = {}) {
    LOGGER.trace("ActorSheet | _render | Called.");
    await super._render(force, options);
    this._setSheetConfig();
  }

  _setSheetConfig() {
    LOGGER.trace("ActorSheet | _setSheetConfig | Called.");
    if (this.options.collapsedSections) {
      (this.options.collapsedSections).forEach((sectionId) => {
        const html = $(this.form).parent();
        let currentTarget = $(html.find(`#${sectionId}`));
        this.options.collapsedSections = this.options.collapsedSections.filter((sectionName) => sectionName !== sectionId);
        $(currentTarget).click();
      });
    }
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    // TODO - Understand how to use getData and when.
    // INFO - Only add new data points to getData when you need a complex struct.
    // DO NOT add new data points into getData to shorten dataPaths
    LOGGER.trace("ActorID getData | CPRActorSheet | Called.");
    const data = super.getData();
    data.filteredItems = this.actor.filteredItems;
    data.installedCyberware = this._getSortedInstalledCyberware();
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Make a roll
    html.find(".rollable").click((event) => this._onRoll(event));

    // Cycle equipment status
    html.find(".equip").click((event) => this._cycleEquipState(event));

    // Repair Armor
    html.find(".repair").click((event) => this._repairArmor(event));

    // Ablate Armor
    html.find(".ablate").click((event) => this._ablateArmor(event));

    // Install Cyberware
    html.find(".install-remove-cyberware").click((event) => this._installRemoveCyberwareAction(event));

    // Generic item action
    html.find(".item-action").click((event) => this._itemAction(event));

    // Reset Death Penalty
    html.find(".reset-value").click((event) => this._resetActorValue(event));

    // Select Roles for Character
    html.find(".select-roles").click((event) => this._selectRoles(event));

    // Set Lifepath for Character
    html.find(".set-lifepath").click((event) => this._setLifepath(event));

    html.find(".sanity-check-cyberware").click(() => this.actor.sanityCheckCyberware());

    html.find(".checkbox").click((event) => this._checkboxToggle(event));

    html.find(".toggle-favorite-visibility").click((event) => {
      const collapsibleElement = $(event.currentTarget).parents(".collapsible");
      const skillCategory = event.currentTarget.id.replace("-showFavorites", "");
      const categoryTarget = $(collapsibleElement.find(`#${skillCategory}`));

      if ($(collapsibleElement).find(".collapse-icon").hasClass("hide")) {
        $(categoryTarget).click();
      }
      $(collapsibleElement).find(".show-favorites").toggleClass("hide");
      $(collapsibleElement).find(".hide-favorites").toggleClass("hide");
      const itemOrderedList = $(collapsibleElement).children("ol");
      const itemList = $(itemOrderedList).children("li");
      itemList.each((lineIndex) => {
        let lineItem = itemList[lineIndex];
        if ($(lineItem).hasClass("item") && $(lineItem).hasClass("favorite")) {
          $(lineItem).toggleClass("hide");
        }
      });
      if ($(collapsibleElement).find(".show-favorites").hasClass("hide")) {
        if (!this.options.collapsedSections.includes(event.currentTarget.id)) {
          this.options.collapsedSections.push(event.currentTarget.id);
        }
      } else {
        this.options.collapsedSections = this.options.collapsedSections.filter((sectionName) => sectionName !== event.currentTarget.id);
        $(categoryTarget).click();
      }
    });

    html.find(".expand-button").click((event) => {
      const collapsibleElement = $(event.currentTarget).parents(".collapsible");
      const favoritesIdentifier = `${event.currentTarget.id}-showFavorites`;
      const categoryTarget = $(collapsibleElement.find(`#${favoritesIdentifier}`));
      $(collapsibleElement).find(".collapse-icon").toggleClass("hide");
      $(collapsibleElement).find(".expand-icon").toggleClass("hide");
      const itemOrderedList = $(collapsibleElement).children("ol");
      const itemList = $(itemOrderedList).children("li");
      itemList.each((lineIndex) => {
        let lineItem = itemList[lineIndex];
        if ($(lineItem).hasClass("item") && !$(lineItem).hasClass("favorite")) {
          $(lineItem).toggleClass("hide");
        }
      });
      if ($(collapsibleElement).find(".expand-icon").hasClass("hide")) {
        if (!this.options.collapsedSections.includes(event.currentTarget.id)) {
          this.options.collapsedSections.push(event.currentTarget.id);
        }
      } else {
        this.options.collapsedSections = this.options.collapsedSections.filter((sectionName) => sectionName !== event.currentTarget.id);
        if (this.options.collapsedSections.includes(favoritesIdentifier)) {
          $(categoryTarget).click();
        }
      }
    });

    // Show edit and delete buttons
    html.find(".row.item").hover(
      (event) => {
        // show edit and delete buttons
        $(event.currentTarget).contents().contents().addClass("show");
      },
      (event) => {
        // hide edit and delete buttons
        $(event.currentTarget).contents().contents().removeClass("show");
      },
    );

    // hide skills by category on clicking header
    html.find(".skills .header").click((event) => {
      const header = $(event.currentTarget);
      const category = header.attr("data-skill-category-name");
      // eslint-disable-next-line no-restricted-syntax
      for (const i of html.find(".row.skill")) {
        if (i.attributes[2].nodeValue === category) {
          // eslint-disable-next-line no-unused-expressions
          i.classList.contains("hide") ? i.classList.remove("hide") : i.classList.add("hide");
        }
      }
    });

    if (!this.options.editable) return;
    // Listeners for editable fields under here

    $("input[type=text]").focusin(() => $(this).select());

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html.find(".skill-level-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));

    html.find(".ip-input").click((event) => event.target.select()).change((event) => this._updateIp(event));

    html.find(".eurobucks-input").click((event) => event.target.select()).change((event) => this._updateEurobucks(event));
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // Dispatcher that executes a roll based on the "type" passed in the event
  async _onRoll(event) {
    LOGGER.trace("ActorID _onRoll | CPRActorSheet | Called.");

    // this will be important later on
    let prevRoll = this._getPreviousRoll();
    LOGGER.debug("previous roll");
    console.log(prevRoll);

    const rollType = $(event.currentTarget).attr("data-roll-type");
    let cprRoll;
    switch (rollType) {
      case "stat": {
        cprRoll = this._createStatRoll(event);
        break;
      }
      case "skill": {
        cprRoll = this._createSkillRoll(event);
        break;
      }
      case "roleAbility": {
        cprRoll = this._createRoleRoll(event);
        break;
      }
      case "attack": {
        cprRoll = this._createAttackRoll(event, false);
        break;
      }
      case "aimed": {
        cprRoll = this._createAttackRoll(event, true);
        break;
      }
      case "suppressive": {
        cprRoll = this._createAutofireRoll(event, true);
        break;
      }
      case "autofire": {
        cprRoll = this._createAutofireRoll(event, false);
        break;
      }
      case "damage": {
        cprRoll = this._createDamageRoll(event, prevRoll);
        break;
      }
      case "deathsave": {
        cprRoll = this._createDeathSaveRoll();
        break;
      }
      default:
    }

    // note for aimed shots this is where location is set
    await this._handleRollDialog(event, cprRoll);

    // decrementing ammo must come after dialog but before the roll in case the user cancels
    if (cprRoll instanceof CPRRolls.CPRAttackRoll) {
      const weaponId = $(event.currentTarget).attr("data-item-id");
      const weaponItem = this.actor.items.find((i) => i.data._id === weaponId);
      const weaponData = weaponItem.getData();
      if (weaponData.isRanged) {
        weaponItem.fireRangedWeapon(cprRoll.fireMode);
      }
    } else if (cprRoll instanceof CPRRolls.CPRDamageRoll) {
      if (cprRoll.isAutofire) {
        cprRoll.setAutofire();
      }
    }

    // Let's roll!
    await cprRoll.roll();

    // Post roll tasks
    if (cprRoll instanceof CPRRolls.CPRDeathSaveRoll) {
      cprRoll.saveResult = this.actor.processDeathSave(cprRoll);
    }

    // output to chat
    cprRoll.displayRoll();

    // Store last roll so we can query and use it
    // after the fact. Examples of this would be
    // if rolling Damage after an attack where autofire
    // was used.
    // Do we want to add this to the template is the
    // question?
    this.actor.data.previousRoll = cprRoll;
  }

  _createStatRoll(event) {
    const statName = $(event.currentTarget).attr("data-roll-title");
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = this.getData().data.stats[statName].value;
    let cprRoll = new CPRRolls.CPRStatRoll(niceStatName, statValue);
    cprRoll.addMod(this._getArmorPenaltyMods(statName));
    return cprRoll;
  }

  _createSkillRoll(event) {
    const itemId = this._getItemId(event);
    const item = this._getOwnedItem(itemId);
    const itemData = item.getData();
    const statName = itemData.stat;
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = this.getData().data.stats[statName].value;
    const skillName = item.name;
    const skillLevel = itemData.level;
    let cprRoll = new CPRRolls.CPRSkillRoll(niceStatName, statValue, skillName, skillLevel);
    cprRoll.addMod(this._getArmorPenaltyMods(statName));
    return cprRoll;
  }

  _createRoleRoll(event) {
    const roleName = $(event.currentTarget).attr("data-roll-title");
    const niceRoleName = SystemUtils.Localize(CPR.roleAbilityList[roleName]);
    const roleValue = this._getRoleValue(roleName);
    return new CPRRolls.CPRRoleRoll(niceRoleName, roleValue);
  }

  _getRoleValue(roleName) {
    const { roleskills: roles } = this.getData().data.roleInfo;
    const abilities = Object.values(roles);
    for (const ability of abilities) {
      const keys = Object.keys(ability);
      for (const key of keys) {
        if (key === roleName) return ability[key];
        if (key === "subSkills") {
          const subSkills = Object.keys(ability[key]);
          for (const subSkill of subSkills) {
            if (subSkill === roleName) return ability.subSkills[subSkill];
          }
        }
      }
    }
    return null;
  }

  _createAttackRoll(event, aimed) {
    const itemId = $(event.currentTarget).attr("data-item-id");
    const weaponItem = this._getOwnedItem(itemId);
    const weaponData = weaponItem.getData();
    const weaponName = weaponItem.name;
    const { weaponType } = weaponData;
    const skillItem = this.actor.items.find((i) => i.name === weaponData.weaponSkill);
    const skillValue = skillItem.getData().level;
    const skillName = skillItem.data.name;
    let cprRoll;
    let statName;
    let niceStatName;
    let statValue;
    if (weaponData.isRanged) {
      statName = "ref";
      niceStatName = SystemUtils.Localize("CPR.ref");
      statValue = this.getData().data.stats.ref.value;
    } else {
      statName = "dex";
      niceStatName = SystemUtils.Localize("CPR.dex");
      statValue = this.getData().data.stats.dex.value;
    }
    if (aimed) {
      cprRoll = new CPRRolls.CPRAimedAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
    } else {
      cprRoll = new CPRRolls.CPRAttackRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
    }

    // apply known mods
    cprRoll.addMod(this._getArmorPenaltyMods(statName));
    cprRoll.addMod(this._getWeaponQualityMod(weaponData));

    if (cprRoll instanceof CPRRolls.CPRAttackRoll && weaponData.isRanged) {
      Rules.lawyer(weaponItem.checkAmmo("single") >= 0, "CPR.weaponattackoutofbullets");
    }
    return cprRoll;
  }

  _createAutofireRoll(event, suppress) {
    const itemId = $(event.currentTarget).attr("data-item-id");
    const weaponItem = this._getOwnedItem(itemId);
    const weaponData = weaponItem.getData();
    const weaponName = weaponItem.name;
    const { weaponType } = weaponData;
    const skillName = SystemUtils.Localize("CPR.autofire");
    const skillValue = this.actor.getSkillLevel("autofire");
    const niceStatName = SystemUtils.Localize("CPR.ref");
    const statValue = this.getData().data.stats.ref.value;
    let cprRoll;
    if (suppress) {
      cprRoll = new CPRRolls.CPRSuppressiveFireRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
    } else {
      cprRoll = new CPRRolls.CPRAutofireRoll(weaponName, niceStatName, statValue, skillName, skillValue, weaponType);
    }
    cprRoll.addMod(this._getArmorPenaltyMods("ref"));
    cprRoll.addMod(this._getWeaponQualityMod(weaponData));
    Rules.lawyer(weaponItem.checkAmmo("autofire") >= 0, "CPR.weaponattackoutofbullets");
    return cprRoll;
  }

  _getWeaponQualityMod(weaponData) {
    if (weaponData.quality === "excellent") {
      return 1;
    }
    return 0;
  }

  _getPreviousRoll() {
    if (typeof this.actor.data.previousRoll !== "undefined") {
      return this.actor.data.previousRoll;
    }
    return "undefined";
  }

  async _handleRollDialog(event, cprRoll) {
    // Handle skipping of the user verification step
    if (!event.ctrlKey) {
      const formData = await VerifyRoll.RenderPrompt(cprRoll);
      mergeObject(cprRoll, formData, { overwrite: true });
    }
  }

  _createDamageRoll(event, prevRoll) {
    const itemId = $(event.currentTarget).attr("data-item-id");
    const weaponItem = this._getOwnedItem(itemId);
    const rollName = weaponItem.data.name;
    const { damage, weaponType } = weaponItem.getData();
    // const { weaponType } = weaponData;
    let cprRoll = new CPRRolls.CPRDamageRoll(rollName, damage, weaponType);

    // remove this once we're in rollcards
    if (typeof prevRoll !== "undefined") {
      if (prevRoll instanceof CPRRolls.CPRAutofireRoll) {
        cprRoll.isAutofire = true;
      } else if (prevRoll instanceof CPRRolls.CPRAimedAttackRoll) {
        cprRoll.isAimed = true;
        cprRoll.location = prevRoll.location;
      }
    }
    return cprRoll;
  }

  _createDeathSaveRoll() {
    const deathSavePenalty = this.actor.getData().derivedStats.deathSave.penalty;
    const deathSaveBasePenalty = this.actor.getData().derivedStats.deathSave.basePenalty;
    const bodyStat = this.getData().data.stats.body.value;
    return new CPRRolls.CPRDeathSaveRoll(deathSavePenalty, deathSaveBasePenalty, bodyStat);
  }

  _resetActorValue(event) {
    const actorValue = $(event.currentTarget).attr("data-value");
    switch (actorValue) {
      case "deathsave": {
        this.actor.resetDeathPenalty();
        break;
      }
      default:
    }
  }

  _repairArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    // XXX: cannot use _getObjProp since we need to update 2 props
    this._updateOwnedItemProp(item, "data.headLocation.ablation", 0);
    this._updateOwnedItemProp(item, "data.bodyLocation.ablation", 0);
  }

  async _ablateArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
    const location = $(event.currentTarget).attr("data-location");
    const armorList = this._getEquippedArmors(location);
    let updateList = [];
    switch (location) {
      case "head": {
        armorList.forEach((a) => {
          let armorData = a.data;
          armorData.data.headLocation.ablation = Math.min((a.getData().headLocation.ablation + 1), a.getData().headLocation.sp);
          updateList.push(armorData);
        });
        await this.actor.updateEmbeddedEntity("OwnedItem", updateList);
        break;
      }
      case "body": {
        armorList.forEach((a) => {
          let armorData = a.data;
          armorData.data.bodyLocation.ablation = Math.min((a.getData().bodyLocation.ablation + 1), a.getData().bodyLocation.sp);
          updateList.push(armorData);
        });
        await this.actor.updateEmbeddedEntity("OwnedItem", updateList);
        break;
      }
      default:
    }
  }

  _cycleEquipState(event) {
    LOGGER.trace("ActorID _cycleEquipState | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const prop = this._getObjProp(event);
    switch (item.data.data.equipped) {
      case "owned": {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        if (item.data.type === "weapon") {
          Rules.lawyer(this._canHoldWeapon(item), "CPR.warningtoomanyhands");
        }
        this._updateOwnedItemProp(item, prop, "equipped");
        break;
      }
      case "equipped": {
        this._updateOwnedItemProp(item, prop, "owned");
        break;
      }
      default: {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
    }
  }

  async _installRemoveCyberwareAction(event) {
    LOGGER.trace("ActorID _installCyberware | CPRActorSheet | Called.");
    const itemId = this._getItemId(event);
    const item = this._getOwnedItem(itemId);
    if (item.getData().isInstalled) {
      const foundationalId = $(event.currentTarget).parents(".item").attr("data-foundational-id");
      this.actor.removeCyberware(itemId, foundationalId);
    } else {
      this.actor.addCyberware(itemId);
    }
  }

  _getSortedInstalledCyberware() {
    LOGGER.trace("ActorID _getInstalledCyberware | CPRActorSheet | Called.");
    // Get all Installed Cyberware first...
    const installedCyberware = this.actor.getInstalledCyberware();
    const installedFoundationalCyberware = installedCyberware.filter((c) => c.data.data.isFoundational === true);

    // Now sort allInstalledCybere by type, and only get foundational
    let sortedInstalledCyberware = {};
    for (const [type] of Object.entries(CPR.cyberwareTypeList)) {
      sortedInstalledCyberware[type] = installedFoundationalCyberware.filter((cyberware) => cyberware.getData().type === type);
      sortedInstalledCyberware[type] = sortedInstalledCyberware[type].map(
        (cyberware) => ({ foundation: cyberware, optionals: [] }),
      );
      sortedInstalledCyberware[type].forEach((entry) => {
        entry.foundation.getData().optionalIds.forEach((id) => entry.optionals.push(this._getOwnedItem(id)));
      });
    }
    return sortedInstalledCyberware;
  }

  // As a first step to re-organizing the methods to the appropriate
  // objects (Actor/Item), let's filter calls to manipulate items
  // through here.  Things such as:
  // Weapon: Load, Unload
  // Armor: Ablate, Repair
  _itemAction(event) {
    LOGGER.trace("ActorID _itemAction | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const actionType = $(event.currentTarget).attr("data-action-type");
    if (item) {
      switch (actionType) {
        case "delete": {
          this._deleteOwnedItem(item);
          break;
        }
        case "create": {
          this._createInventoryItem($(event.currentTarget).attr("data-item-type"));
          break;
        }
        // TODO
        case "ablate-armor": {
          item.ablateArmor();
          break;
        }
        case "favorite": {
          item.toggleFavorite();
          break;
        }
        default: {
          item.doAction(this.actor, event.currentTarget.attributes);
        }
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item.data);
    }
  }

  // TODO - Move to cpr-actor
  _getEquippedArmors(location) {
    LOGGER.trace("ActorID _getEquippedArmors | CPRActorSheet | Called.");
    // TODO - Helper function on ACTOR to get equipedArmors
    const armors = this.actor.items.filter((item) => item.data.type === "armor");
    const equipped = armors.filter((item) => item.getData().equipped === "equipped");

    if (location === "body") {
      return equipped.filter((item) => item.getData().isBodyLocation);
    }
    if (location === "head") {
      return equipped.filter((item) => item.getData().isHeadLocation);
    }
    throw new Error(`Bad location given: ${location}`);
  }

  // ARMOR HELPERS
  // TODO - Move to cpr-actor
  _getArmorValue(valueType, location) {
    LOGGER.trace("ActorID _getArmorValue| CPRActorSheet | Called.");

    const armors = this._getEquippedArmors(location);
    let sps;
    let penalties;

    if (location === "body") {
      sps = armors.map((a) => a.data.data.bodyLocation.sp);
    } else if (location === "head") {
      sps = armors.map((a) => a.data.data.headLocation.sp);
    } // we assume getEquippedArmors will throw an error with a bad loc
    penalties = armors.map((a) => a.data.data.penalty);
    penalties = penalties.map(Math.abs);

    penalties.push(0);
    sps.push(0); // force a 0 if nothing is equipped

    if (valueType === "sp") {
      return Math.max(...sps); // Math.max treats null values in array as 0
    }
    if (valueType === "penalty") {
      return Math.max(...penalties); // Math.max treats null values in array as 0
    }
    return 0;
  }

  // TODO - Move to cpr-actor
  _getHands() {
    LOGGER.trace("ActorID _getHands | CPRActorSheet | Called.");
    return 2;
  }

  // TODO - Move to cpr-actor
  _getFreeHands() {
    LOGGER.trace("ActorID _getFreeHands | CPRActorSheet | Called.");
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map((w) => w.data.data.handsReq);
    const freeHands = this._getHands() - needed.reduce((a, b) => a + b, 0);
    return freeHands;
  }

  // TODO - Move to cpr-actor
  _canHoldWeapon(weapon) {
    LOGGER.trace("ActorID _canHoldWeapon | CPRActorSheet | Called.");
    const needed = weapon.data.data.handsReq;
    if (needed > this._getFreeHands()) {
      return false;
    }
    return true;
  }

  // TODO - Move to cpr-actor
  _getEquippedWeapons() {
    LOGGER.trace("ActorID _getEquippedWeapons | CPRActorSheet | Called.");
    const weapons = this.actor.data.filteredItems.weapon;
    return weapons.filter((a) => a.getData().equipped === "equipped");
  }

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.
  // TODO - Move to cpr-actor
  _updateSkill(event) {
    LOGGER.trace("ActorID _updateSkill | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    item.setSkillLevel(parseInt(event.target.value, 10));
    this._updateOwnedItem(item);
  }

  _updateEurobucks(event) {
    LOGGER.trace("ActorID _updateEurobucks | CPRActorSheet | Called.");
    this._setEb(parseInt(event.target.value, 10), "player input in gear tab");
  }

  _updateIp(event) {
    LOGGER.trace("ActorID _updateIp | CPRActorSheet | Called.");
    this._setIp(parseInt(event.target.value, 10), "player input in gear tab");
  }

  // OWNED ITEM HELPER FUNCTIONS
  // TODO - Assert all usage correct.
  _updateOwnedItemProp(item, prop, value) {
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
    setProperty(item.data, prop, value);
    this._updateOwnedItem(item);
  }

  _updateOwnedItem(item) {
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
    return this.actor.updateEmbeddedEntity("OwnedItem", item.data);
  }

  _renderItemCard(event) {
    LOGGER.trace("ActorID _itemUpdate | CPRActorSheet | Called.");
    const itemId = this._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
    item.sheet.render(true);
  }

  _getItemId(event) {
    LOGGER.trace("ActorID _getItemId | CPRActorSheet | Called.");
    let id = $(event.currentTarget).parents(".item").attr("data-item-id");
    return id;
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id === itemId);
  }

  _getObjProp(event) {
    return $(event.currentTarget).attr("data-item-prop");
  }

  async _deleteOwnedItem(item) {
    LOGGER.trace("ActorID _deleteOwnedItem | CPRActorSheet | Called.");
    // There's a bug here somewhere.  If the prompt is disabled, it doesn't seem
    // to delete, but if the player is prompted, it deletes fine???
    const setting = game.settings.get("cyberpunk-red-core", "deleteItemConfirmation");
    // If setting is true, prompt before delete, else delete.
    if (setting) {
      const promptMessage = `${SystemUtils.Localize("CPR.deleteconfirmation")} ${item.data.name}?`;
      const confirmDelete = await ConfirmPrompt.RenderPrompt(SystemUtils.Localize("CPR.deletedialogtitle"), promptMessage);
      if (!confirmDelete) {
        return;
      }
    }
    if (item.type === "ammo") {
      const weapons = this.actor.data.filteredItems.weapon;
      let ammoIsLoaded = false;
      weapons.forEach((weapon) => {
        const weaponData = weapon.data.data;
        if (weaponData.isRanged) {
          if (weaponData.magazine.ammoId === item._id) {
            const warningMessage = `${game.i18n.localize("CPR.ammodeletewarning")}: ${weapon.name}`;
            SystemUtils.DisplayMessage("warn", warningMessage);
            ammoIsLoaded = true;
          }
        }
      });
      if (ammoIsLoaded) {
        return;
      }
    }
    await this.actor.deleteEmbeddedEntity("OwnedItem", item._id);
  }

  // TODO - Revist, do we need template data? Is function used.
  _addSkill() {
    LOGGER.trace("ActorID _addSkill | CPRActorSheet | called.");
    const itemData = {
      name: "skill",
      type: "skill",
      data: {},
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true });
  }

  // TODO - Fix
  _getArmorPenaltyMods(stat) {
    const penaltyStats = ["ref", "dex", "move"];
    const penaltyMods = [0];
    if (penaltyStats.includes(stat)) {
      const coverage = ["head", "body"];
      coverage.forEach((location) => {
        const penaltyValue = Number(this._getArmorValue("penalty", location));
        if (penaltyValue > 0) {
          penaltyMods.push(0 - penaltyValue);
        }
      });
    }
    return Math.min(...penaltyMods);
  }

  async _selectRoles(event) {
    let formData = { actor: this.actor.getData().roleInfo, roles: CPR.roleList };
    formData = await SelectRolePrompt.RenderPrompt(formData);
    await this.actor.setRoles(formData);
  }

  async _setLifepath(event) {
    const formData = await SetLifepathPrompt.RenderPrompt(this.actor.data);
    await this.actor.setLifepath(formData);
  }

  _createInventoryItem(event) {
    // We can allow a global setting which allows/denies players from creating their
    // own items?
    const setting = true;
    if (setting) {
      const itemType = $(event.currentTarget).attr("data-item-type");
      const itemName = `${SystemUtils.Localize("CPR.new")} ${itemType.capitalize()}`;
      const itemData = {
        name: itemName,
        type: itemType,
        // eslint-disable-next-line no-undef
        data: duplicate(itemType),
      };
      this.actor.createEmbeddedEntity("OwnedItem", itemData);
    }
  }

  /* Ledger methods */

  /* Wealth */
  _setEb(value, reason) {
    LOGGER.trace("ActorID _setEb | CPRActorSheet | called.");
    return this.actor.setLedgerProperty("wealth", value, reason);
  }

  _gainEb(value, reason) {
    LOGGER.trace("ActorID _gainEb | CPRActorSheet | called.");
    return this.actor.deltaLedgerProperty("wealth", value, reason);
  }

  _loseEb(value, reason) {
    LOGGER.trace("ActorID _loseEb | CPRActorSheet | called.");
    let tempVal = value;
    if (tempVal > 0) {
      tempVal = -tempVal;
    }
    const ledgerProp = this.actor.deltaLedgerProperty("wealth", tempVal, reason);
    Rules.lawyer(ledgerProp.value > 0, "CPR.warningnotenougheb");
    return ledgerProp;
  }

  _listEbRecords() {
    LOGGER.trace("ActorID _listEbRecords | CPRActorSheet | called.");
    return this.actor.listRecords("wealth");
  }

  _clearEbRecords() {
    LOGGER.trace("ActorID _clearEbRecords | CPRActorSheet | called.");
    return this.actor.clearLedger("wealth");
  }

  /* Improvement Points */
  _setIp(value, reason) {
    LOGGER.trace("ActorID _setIp | CPRActorSheet | called.");
    return this.actor.setLedgerProperty("improvementPoints", value, reason);
  }

  _gainIp(value, reason) {
    LOGGER.trace("ActorID _gainIp | CPRActorSheet | called.");
    return this.actor.deltaLedgerProperty("improvementPoints", value, reason);
  }

  _loseIp(value, reason) {
    LOGGER.trace("ActorID _loseIp | CPRActorSheet | called.");
    let tempVal = value;
    if (tempVal > 0) {
      tempVal = -tempVal;
    }
    const ledgerProp = this.actor.deltaLedgerProperty("improvementPoints", tempVal, reason);
    Rules.lawyer(ledgerProp.value > 0, "CPR.warningnotenougheb");
    return ledgerProp;
  }

  _listIpRecords() {
    LOGGER.trace("ActorID _listIpRecords | CPRActorSheet | called.");
    return this.actor.listRecords("improvementPoints");
  }

  _clearIpRecords() {
    LOGGER.trace("ActorID _clearIpRecords | CPRActorSheet | called.");
    return this.actor.clearLedger("improvementPoints");
  }
}
