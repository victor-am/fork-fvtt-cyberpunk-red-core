/* global ActorSheet, mergeObject, $, setProperty game getProperty */
/* eslint class-methods-use-this: ["warn", {
  "exceptMethods": ["_handleRollDialog", "_getHands", "_getItemId", "_getObjProp"]
}] */
import * as CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import CPRChat from "../../chat/cpr-chat.js";
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import RollCriticalInjuryPrompt from "../../dialog/cpr-roll-critical-injury-prompt.js";
import LOGGER from "../../utils/cpr-logger.js";
import Rules from "../../utils/cpr-rules.js";
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
      height: 590,
      scrollY: [".right-content-section"],
    });
  }

  async _render(force = false, options = {}) {
    LOGGER.trace("ActorSheet | _render | Called.");
    await super._render(force, options);
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

    html.find(".item-view").click((event) => this._renderReadOnlyItemCard(event));

    // Reset Death Penalty
    html.find(".reset-value").click((event) => this._resetActorValue(event));

    // Select Roles for Character
    html.find(".select-roles").click(() => this._selectRoles());

    // Set Lifepath for Character
    html.find(".set-lifepath").click(() => this._setLifepath());

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
        const lineItem = itemList[lineIndex];
        if ($(lineItem).hasClass("item") && $(lineItem).hasClass("favorite")) {
          $(lineItem).toggleClass("hide");
        }
      });
      if ($(collapsibleElement).find(".show-favorites").hasClass("hide")) {
        if (!this.options.collapsedSections.includes(event.currentTarget.id)) {
          this.options.collapsedSections.push(event.currentTarget.id);
        }
      } else {
        this.options.collapsedSections = this.options.collapsedSections.filter(
          (sectionName) => sectionName !== event.currentTarget.id,
        );
        $(categoryTarget).click();
      }
    });

    html.find(".expand-button").click((event) => {
      const collapsibleElement = $(event.currentTarget).parents(".collapsible");
      $(collapsibleElement).find(".collapse-icon").toggleClass("hide");
      $(collapsibleElement).find(".expand-icon").toggleClass("hide");
      const itemOrderedList = $(collapsibleElement).children("ol");
      const itemList = $(itemOrderedList).children("li");
      itemList.each((lineIndex) => {
        const lineItem = itemList[lineIndex];
        if ($(lineItem).hasClass("item") && !$(lineItem).hasClass("favorite")) {
          $(lineItem).toggleClass("hide");
        }
      });

      if (this.options.collapsedSections.includes(event.currentTarget.id)) {
        this.options.collapsedSections = this.options.collapsedSections.filter(
          (sectionName) => sectionName !== event.currentTarget.id,
        );
      } else {
        this.options.collapsedSections.push(event.currentTarget.id);
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

    // Item Dragging

    const handler = (ev) => this._onDragItemStart(ev);
    html.find(".item").each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });

    if (!this.options.editable) return;
    // Listeners for editable fields under here

    $("input[type=text]").focusin(() => $(this).select());

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));

    // Roll critical injuries and add to sheet
    html.find(".roll-critical-injury").click(() => this._rollCriticalInjury());

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html.find(".skill-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));

    html.find(".weapon-input").click((event) => event.target.select()).change((event) => this._updateWeaponAmmo(event));

    html.find(".ip-input").click((event) => event.target.select()).change((event) => this._updateIp(event));

    html.find(".ability-input").click((event) => event.target.select()).change((event) => this._updateRoleAbility(event));

    html.find(".eurobucks-input").click((event) => event.target.select()).change(
      (event) => this._updateEurobucks(event),
    );

    html.find(".fire-checkbox").click((event) => this._fireCheckboxToggle(event));

    super.activateListeners(html);
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // Dispatcher that executes a roll based on the "type" passed in the event
  async _onRoll(event) {
    LOGGER.trace("ActorID _onRoll | CPRActorSheet | Called.");

    let rollType = $(event.currentTarget).attr("data-roll-type");
    let cprRoll;
    let item = null;
    switch (rollType) {
      case CPRRolls.rollTypes.DEATHSAVE:
      case CPRRolls.rollTypes.ROLEABILITY:
      case CPRRolls.rollTypes.STAT: {
        const rollName = $(event.currentTarget).attr("data-roll-title");
        cprRoll = this.actor.createRoll(rollType, rollName);
        break;
      }
      case CPRRolls.rollTypes.SKILL: {
        const itemId = this._getItemId(event);
        item = this._getOwnedItem(itemId);
        cprRoll = item.createRoll(rollType, this.actor);
        break;
      }
      case CPRRolls.rollTypes.DAMAGE: {
        const itemId = this._getItemId(event);
        item = this._getOwnedItem(itemId);
        rollType = this._getFireCheckbox(event);
        cprRoll = item.createDamageRoll(rollType, this.actor);
        if (rollType === CPRRolls.rollTypes.AIMED) {
          cprRoll.location = this.actor.getFlag("cyberpunk-red-core", "aimedLocation") || "body";
        }
        break;
      }
      case CPRRolls.rollTypes.ATTACK: {
        const itemId = this._getItemId(event);
        item = this._getOwnedItem(itemId);
        rollType = this._getFireCheckbox(event);
        cprRoll = item.createAttackRoll(rollType, this.actor);
        break;
      }
      default:
    }

    // note: for aimed shots this is where location is set
    await cprRoll.handleRollDialog(event);

    if (item !== null) {
      // Do any actions that need to be done as part of a roll, like ammo decrementing
      cprRoll = await item.confirmRoll(cprRoll);
    }

    // Let's roll!
    await cprRoll.roll();

    // Post roll tasks
    if (cprRoll instanceof CPRRolls.CPRDeathSaveRoll) {
      cprRoll.saveResult = this.actor.processDeathSave(cprRoll);
    }

    // output to chat
    const token = this.token === null ? null : this.token.data._id;
    cprRoll.entityData = { actor: this.actor._id, token };
    if (item) {
      cprRoll.entityData.item = item._id;
    }
    CPRChat.RenderRollCard(cprRoll);

    // save the location so subsequent damage rolls hit/show the same place
    if (cprRoll instanceof CPRRolls.CPRAimedAttackRoll) {
      this.actor.setFlag("cyberpunk-red-core", "aimedLocation", cprRoll.location);
    }
  }

  _getFireCheckbox(event) {
    LOGGER.trace("ActorID _getFireCheckbox | CPRActorSheet | Called.");
    const weaponID = $(event.currentTarget).attr("data-item-id");
    const box = this.actor.getFlag("cyberpunk-red-core", `firetype-${weaponID}`);
    if (box) {
      return box;
    }
    return CPRRolls.rollTypes.ATTACK;
  }

  _resetActorValue(event) {
    const actorValue = $(event.currentTarget).attr("data-value");
    switch (actorValue) {
      case CPRRolls.rollTypes.DEATHSAVE: {
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
    this._updateOwnedItemProp(item, "data.shieldHitPoints.value", item.data.data.shieldHitPoints.max);
  }

  async _ablateArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
    const location = $(event.currentTarget).attr("data-location");
    const armorList = this.actor.getEquippedArmors(location);
    const updateList = [];
    switch (location) {
      case "head": {
        armorList.forEach((a) => {
          const armorData = a.data;
          armorData.data.headLocation.ablation = Math.min(
            (a.getData().headLocation.ablation + 1), a.getData().headLocation.sp,
          );
          updateList.push(armorData);
        });
        await this.actor.updateEmbeddedEntity("OwnedItem", updateList);
        break;
      }
      case "body": {
        armorList.forEach((a) => {
          const armorData = a.data;
          armorData.data.bodyLocation.ablation = Math.min(
            (a.getData().bodyLocation.ablation + 1), a.getData().bodyLocation.sp,
          );
          updateList.push(armorData);
        });
        await this.actor.updateEmbeddedEntity("OwnedItem", updateList);
        break;
      }
      case "shield": {
        armorList.forEach((a) => {
          const armorData = a.data;
          armorData.data.shieldHitPoints.value = Math.max((a.getData().shieldHitPoints.value - 1), 0);
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
    const sortedInstalledCyberware = {};
    for (const [type] of Object.entries(CPR.cyberwareTypeList)) {
      sortedInstalledCyberware[type] = installedFoundationalCyberware.filter(
        (cyberware) => cyberware.getData().type === type,
      );
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

  // ARMOR HELPERS
  // TODO - Move to armor helpers to cpr-actor
  // TODO - Assure all private methods can be used outside of the context of UI controls as well.

  _getHands() {
    LOGGER.trace("ActorID _getHands | CPRActorSheet | Called.");
    return 2;
  }

  _getFreeHands() {
    LOGGER.trace("ActorID _getFreeHands | CPRActorSheet | Called.");
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map((w) => w.data.data.handsReq);
    const freeHands = this._getHands() - needed.reduce((a, b) => a + b, 0);
    return freeHands;
  }

  _canHoldWeapon(weapon) {
    LOGGER.trace("ActorID _canHoldWeapon | CPRActorSheet | Called.");
    const needed = weapon.data.data.handsReq;
    if (needed > this._getFreeHands()) {
      return false;
    }
    return true;
  }

  _getEquippedWeapons() {
    LOGGER.trace("ActorID _getEquippedWeapons | CPRActorSheet | Called.");
    const weapons = this.actor.data.filteredItems.weapon;
    return weapons.filter((a) => a.getData().equipped === "equipped");
  }

  _updateSkill(event) {
    LOGGER.trace("ActorID _updateSkill | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const updateType = $(event.currentTarget).attr("data-item-prop");
    if (updateType === "data.level") {
      item.setSkillLevel(parseInt(event.target.value, 10));
    }
    if (updateType === "data.mod") {
      item.setSkillMod(parseInt(event.target.value, 10));
    }
    this._updateOwnedItem(item);
  }

  _updateRoleAbility(event) {
    LOGGER.trace("ActorID _updateSkill | CPRActorSheet | Called.");
    const role = $(event.currentTarget).attr("data-role-name");
    const ability = $(event.currentTarget).attr("data-ability-name");
    const subskill = $(event.currentTarget).attr("data-subskill-name");
    const value = parseInt(event.target.value, 10);
    if (subskill) {
      this.actor.data.data.roleInfo.roleskills[role].subSkills[subskill] = value;
    } else {
      this.actor.data.data.roleInfo.roleskills[role][ability] = value;
    }
  }

  _updateWeaponAmmo(event) {
    LOGGER.trace("ActorID _updateCurrentWeaponAmmo | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const updateType = $(event.currentTarget).attr("data-item-prop");
    if (updateType === "data.magazine.value") {
      item.setWeaponAmmo(event.target.value);
    }
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
    if (event.ctrlKey) {
      CPRChat.RenderItemCard(item);
    } else {
      item.sheet.options.editable = true;
      item.sheet.render(true);
    }
  }

  _renderReadOnlyItemCard(event) {
    LOGGER.trace("ActorID _itemUpdate | CPRActorSheet | Called.");
    const itemId = this._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
    item.sheet.options.editable = false;
    item.sheet.render(true);
  }

  _getItemId(event) {
    LOGGER.trace("ActorID _getItemId | CPRActorSheet | Called.");
    let id = $(event.currentTarget).parents(".item").attr("data-item-id");
    if (typeof id === "undefined") {
      LOGGER.debug("Could not find itemId in parent elements, trying currentTarget");
      id = $(event.currentTarget).attr("data-item-id");
    }
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
      const confirmDelete = await ConfirmPrompt.RenderPrompt(
        SystemUtils.Localize("CPR.deletedialogtitle"), promptMessage,
      );
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

  _fireCheckboxToggle(event) {
    LOGGER.trace("_fireCheckboxToggle Called | CPRActorSheet | Called.");
    const weaponID = $(event.currentTarget).attr("data-item-id");
    const firemode = $(event.currentTarget).attr("data-fire-mode");
    const flag = getProperty(this.actor.data, `flags.cyberpunk-red-core.firetype-${weaponID}`);
    LOGGER.debug(`firemode is ${firemode}`);
    LOGGER.debug(`weaponID is ${weaponID}`);
    LOGGER.debug(`flag is ${flag}`);
    if (flag === firemode) {
      // if the flag was already set to firemode, that means we unchecked a box
      this.actor.unsetFlag("cyberpunk-red-core", `firetype-${weaponID}`);
    } else {
      this.actor.setFlag("cyberpunk-red-core", `firetype-${weaponID}`, firemode);
    }
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

  async _selectRoles() {
    let formData = { actor: this.actor.getData().roleInfo, roles: CPR.roleList };
    formData = await SelectRolePrompt.RenderPrompt(formData);
    await this.actor.setRoles(formData);
  }

  async _setLifepath() {
    const formData = await SetLifepathPrompt.RenderPrompt(this.actor.data);
    await this.actor.setLifepath(formData);
  }

  _createInventoryItem(event) {
    // We can allow a global setting which allows/denies players from creating their
    // own items?
    const setting = true;
    if (setting) {
      const itemType = $(event.currentTarget).attr("data-item-type");
      const itemTypeNice = itemType.toLowerCase().capitalize();
      const itemString = "ITEM.Type";
      const itemTypeLocal = itemString.concat(itemTypeNice);
      const itemName = `${SystemUtils.Localize("CPR.new")} ${SystemUtils.Localize(itemTypeLocal)}`;
      const itemData = {
        name: itemName,
        type: itemType,
        // eslint-disable-next-line no-undef
        data: duplicate(itemType),
      };
      this.actor.createEmbeddedEntity("OwnedItem", itemData);
    }
  }

  _getCriticalInjuryTables() {
    const critPattern = new RegExp("^Critical Injury|^CriticalInjury|^CritInjury|^Crit Injury|^Critical Injuries|^CriticalInjuries");
    const tableNames = [];
    const tableList = game.tables.filter((t) => t.data.name.match(critPattern));
    tableList.forEach((table) => tableNames.push(table.data.name));
    return tableNames.sort();
  }

  async _setCriticalInjuryTable() {
    const critInjuryTables = this._getCriticalInjuryTables();
    const formData = await RollCriticalInjuryPrompt.RenderPrompt(critInjuryTables);
    return formData.criticalInjuryTable;
  }
  
  async _rollCriticalInjury() {
    const tableName = await this._setCriticalInjuryTable();
    const table = game.tables.entities.find((t) => t.name === tableName);
    this._drawCriticalInjuryTable(tableName, table, 0);
  }
  
  async _drawCriticalInjuryTable(tableName, table, iteration) {
    if (iteration > 100) {
      //count number of critical injuries of the type given in the table
      const crit = game.items.find((item) => ((item.type === "criticalInjury") && (item.name === table.data.results[0].text)));
      // eslint-disable-next-line no-undef
      if (!crit) {
        SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.criticalinjurynonewarning")));
        return;
      }
      const critType = crit.data.data.location;
      let numberCritInjurySameType = 0;
      this.actor.data.filteredItems.criticalInjury.forEach((injury) => { if (injury.data.data.location === critType) {numberCritInjurySameType += 1;} } );
      if (table.data.results.length <= numberCritInjurySameType) {
	    SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.criticalinjuryduplicateallwarning")));
	    return;
      }
      if (iteration > 1000) {
        SystemUtils.DisplayMessage("error", (game.i18n.localize("CPR.criticalinjuryduplicateloopwarning")));
        return; //Prevent endless loop in case of mixed (head and body) Critical Injury tables.
      }
    }
    table.draw({ displayChat: false })
      .then(async (res) => {
        if (res.results.length > 0) {
          //Check if the critical Injury already exists on the character
          let injuryAlreadyExists = false
          this.actor.data.filteredItems.criticalInjury.forEach((injury) => { if (injury.data.name === res.results[0].text) {injuryAlreadyExists = true;} } );
          if (injuryAlreadyExists) {
            const setting = game.settings.get("cyberpunk-red-core", "preventDuplicateCriticalInjuries");
            if (setting === "reroll") {
              await this._drawCriticalInjuryTable(tableName, table, iteration+1);
              return;
            }
            if (setting === "warn"){
              SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.criticalinjuryduplicatewarning")));
            }
          }
          const crit = game.items.find((item) => ((item.type === "criticalInjury") && (item.name === res.results[0].text)));
          // eslint-disable-next-line no-undef
          if (!crit) {
            SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.criticalinjurynonewarning")));
            return;
          }
          // eslint-disable-next-line no-undef
          const itemData = duplicate(crit.data);
          const result = await this.actor.createEmbeddedEntity("OwnedItem", itemData, { force: true });
          const cprRoll = new CPRRolls.CPRTableRoll(crit.data.name, res.roll, "systems/cyberpunk-red-core/templates/chat/cpr-critical-injury-rollcard.hbs");
          cprRoll.rollCardExtraArgs.tableName = tableName;
          cprRoll.rollCardExtraArgs.itemName = result.name;
          cprRoll.rollCardExtraArgs.itemImg = result.img;
          cprRoll.entityData = { actor: this.actor._id, token: this.token.id, item: result._id };
          CPRChat.RenderRollCard(cprRoll);
        }
      });
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

  _onDragItemStart(event) {
    LOGGER.trace("ActorID _onDragItemStart | CPRActorSheet | called.");
    const itemId = event.currentTarget.getAttribute("data-item-id");
    const item = this.actor.getEmbeddedEntity("OwnedItem", itemId);
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      actorId: this.actor._id,
      data: item,
      root: event.currentTarget.getAttribute("root"),
    }));
  }

  async _onDrop(event) {
    LOGGER.trace("ActorID _onDrop | CPRActorSheet | called.");
    // This is called whenever something is dropped onto the character sheet
    const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (dragData.actorId !== undefined) {
      // Transfer ownership from one player to another
      const actor = game.actors.find((a) => a._id === dragData.actorId);
      if (actor) {
        if (actor.data._id === this.actor.data._id
          || dragData.data.data.core === true
          || (dragData.data.type === "cyberware" && dragData.data.data.isInstalled)) {
          return;
        }
        super._onDrop(event).then(actor.deleteEmbeddedEntity("OwnedItem", dragData.data._id));
      }
    } else {
      super._onDrop(event);
    }
  }
}
