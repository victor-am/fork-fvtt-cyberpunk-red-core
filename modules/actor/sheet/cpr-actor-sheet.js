/* global ActorSheet, $, setProperty, game, getProperty, mergeObject duplicate */
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import * as CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import CPRChat from "../../chat/cpr-chat.js";
import LOGGER from "../../utils/cpr-logger.js";
import RollCriticalInjuryPrompt from "../../dialog/cpr-roll-critical-injury-prompt.js";
import Rules from "../../utils/cpr-rules.js";
import SplitItemPrompt from "../../dialog/cpr-split-item-prompt.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the basic ActorSheet, which comes from Foundry. Not all sheets used in
 * this system module may extend from this. Others also extend ActorSheet. CPRActor
 * is used for common code between Mook sheets and Character sheets.
 * @extends {ActorSheet}
 */
export default class CPRActorSheet extends ActorSheet {
  /**
   * We extend ActorSheet._render to enable automatic window resizing.
   * Only resize the sheet with default size, as render option is called on several differnt update events.
   * Should one still desire resizing the sheet afterwards, please call _automaticResize explicitly.
   *
   * @override
   * @private
   * @param {Boolean} force - for this to be rendered. We don't use this, but the parent class does.
   * @param {Object} options - rendering options that are passed up the chain to the parent
   */
  async _render(force = false, options = {}) {
    LOGGER.trace("_render | CPRActorSheet | Called.");
    await super._render(force, options);
    if (this.position.width === this.options.defaultWidth && this.position.height === this.options.defaultHeight) {
      this._automaticResize();
    }
  }

  /**
   * Set the default width and height so auto-resizing of the window works. Child classes will
   * merge additional default options with this object. The scrollY option identifies elements where the
   * vertical position should be preserved during a re-render.
   *
   * See https://foundryvtt.com/api/Application.html for the complete list of options available.
   *
   * @override
   * @returns - sheet options merged with default options in ActorSheet
   */
  static get defaultOptions() {
    LOGGER.trace("ActorID defaultOptions | CPRActorSheet | Called.");
    const defaultWidth = 800;
    const defaultHeight = 590;
    return mergeObject(super.defaultOptions, {
      classes: super.defaultOptions.classes.concat(["sheet", "actor"]),
      defaultWidth,
      defaultHeight,
      width: defaultWidth,
      height: defaultHeight,
      scrollY: [".right-content-section", ".top-pane-gear"],
    });
  }

  /**
   * Get actor data into a more convenient organized structure. This should be called sparingly in code.
   * Only add new data points to getData when you need a complex struct, not when you only need to add
   * new data points to shorten dataPaths.
   *
   * @override
   * @returns {Object} data - a curated structure of actorSheet data
   */
  getData() {
    LOGGER.trace("getData | CPRActorSheet | Called.");
    const data = super.getData();
    data.filteredItems = this.actor.data.filteredItems;
    if (this.actor.data.type === "mook" || this.actor.data.type === "character") {
      data.installedCyberware = this._getSortedInstalledCyberware();

      data.fightOptions = (this.actor.hasItemTypeEquipped("cyberdeck")) ? "both" : "";
      let fightState = this.actor.getFlag("cyberpunk-red-core", "fightState");
      if (!fightState || data.fightOptions !== "both") {
        fightState = "Meatspace";
      }
      data.fightState = fightState;
      data.cyberdeck = "";
      if (fightState === "Netspace") {
        data.cyberdeck = this.actor.getEquippedCyberdeck();
      }
      const programsInstalled = [];
      this.actor.data.filteredItems.cyberdeck.forEach((deck) => {
        deck.data.data.programs.installed.forEach((program) => {
          programsInstalled.push(program._id);
        });
      });
      data.filteredItems.programsInstalled = programsInstalled;
    }
    return data;
  }

  /**
   * Used in getData to turn installable Cyberware data into an organized structure
   *
   * @private
   * @returns - object data about Cyberware
   */
  _getSortedInstalledCyberware() {
    LOGGER.trace("_getSortedInstalledCyberware | CPRActorSheet | Called.");
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

  /**
   * Activate listeners for the sheet. This should be only common listeners across Mook and Character sheets.
   * This has to call super at the end for Foundry to process events properly and get built-in functionality
   * like dragging items to sheets.
   *
   * @override
   * @param {Object} html - the DOM object
   */
  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRActorSheet | Called.");

    // allow navigation for non owned actors
    this._tabs.forEach((t) => t.bind(html[0]));

    // Make a roll
    html.find(".rollable").click((event) => this._onRoll(event));

    // Ablate Armor
    html.find(".ablate").click((event) => this._ablateArmor(event));

    // Set Armor as Current
    html.find(".armor-current").click((event) => this._makeArmorCurrent(event));

    // Generic item action
    html.find(".item-action").click((event) => this._itemAction(event));

    // bring up read-only versions of the item card (sheet), used with installed cyberware
    html.find(".item-view").click((event) => this._renderReadOnlyItemCard(event));

    // Reset Death Penalty
    html.find(".reset-value").click((event) => this._resetDeathSave(event));

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

    // Item Dragging
    const handler = (ev) => this._onDragItemStart(ev);
    html.find(".item").each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });

    if (!this.options.editable) return;
    // Listeners for editable fields under here. Fields might not be editable because
    // the user viewing the sheet might not have permission to. They may not be the owner.

    $("input[type=text]").focusin(() => $(this).select());

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Roll critical injuries and add to sheet
    html.find(".roll-critical-injury").click(() => this._rollCriticalInjury());

    // set/unset "checkboxes" used with fire modes
    html.find(".fire-checkbox").click((event) => this._fireCheckboxToggle(event));

    // Sheet resizing
    html.find(".tab-label:not(.skills-tab):not(.gear-tab):not(.cyberware-tab)").click(
      () => this._automaticResize(),
    );

    super.activateListeners(html);
  }

  /**
   * Dispatcher that executes a roll based on the "type" passed in the event
   *
   * @private
   * @callback
   * @param {Object} event - object with details of the event
   */
  async _onRoll(event) {
    LOGGER.trace("_onRoll | CPRActorSheet | Called.");
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
        const itemId = CPRActorSheet._getItemId(event);
        item = this._getOwnedItem(itemId);
        cprRoll = item.createRoll(rollType, this.actor);
        break;
      }
      case CPRRolls.rollTypes.DAMAGE: {
        const itemId = CPRActorSheet._getItemId(event);
        item = this._getOwnedItem(itemId);
        const damageType = this._getFireCheckbox(event);
        cprRoll = item.createRoll(rollType, this.actor, { damageType });
        if (rollType === CPRRolls.rollTypes.AIMED) {
          cprRoll.location = this.actor.getFlag("cyberpunk-red-core", "aimedLocation") || "body";
        }
        break;
      }
      case CPRRolls.rollTypes.ATTACK: {
        const itemId = CPRActorSheet._getItemId(event);
        item = this._getOwnedItem(itemId);
        rollType = this._getFireCheckbox(event);
        cprRoll = item.createRoll(rollType, this.actor);
        break;
      }
      case CPRRolls.rollTypes.INTERFACEABILITY: {
        const interfaceAbility = $(event.currentTarget).attr("data-interface-ability");
        const cyberdeckId = $(event.currentTarget).attr("data-cyberdeck-id");
        const cyberdeck = this._getOwnedItem(cyberdeckId);
        cprRoll = cyberdeck.createRoll(rollType, this.actor, { interfaceAbility });
        break;
      }
      case CPRRolls.rollTypes.CYBERDECKPROGRAM: {
        const programId = $(event.currentTarget).attr("data-program-id");
        const cyberdeckId = $(event.currentTarget).attr("data-cyberdeck-id");
        const executionType = $(event.currentTarget).attr("data-execution-type");
        const cyberdeck = this._getOwnedItem(cyberdeckId);
        const interfaceValue = this.actor._getRoleValue("interface");
        const extraData = {
          cyberdeckId,
          programId,
          executionType,
          interfaceValue,
        };
        cprRoll = cyberdeck.createRoll(rollType, this.actor, extraData);
        break;
      }
      default:
    }

    // note: for aimed shots this is where location is set
    const keepRolling = await cprRoll.handleRollDialog(event);
    if (!keepRolling) {
      return;
    }

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
    cprRoll.entityData = { actor: this.actor.id, token };
    if (item) {
      cprRoll.entityData.item = item.id;
    }
    CPRChat.RenderRollCard(cprRoll);

    // save the location so subsequent damage rolls hit/show the same place
    if (cprRoll instanceof CPRRolls.CPRAimedAttackRoll) {
      this.actor.setFlag("cyberpunk-red-core", "aimedLocation", cprRoll.location);
    }
  }

  /**
   * Callback for the checkboxes that control weapon fire modes
   *
   * @callback
   * @private
   * @param {Object} event - object with details of the event
   * @returns {CPRRoll}
   */
  _getFireCheckbox(event) {
    LOGGER.trace("_getFireCheckbox | CPRActorSheet | Called.");
    const weaponID = $(event.currentTarget).attr("data-item-id");
    const box = this.actor.getFlag("cyberpunk-red-core", `firetype-${weaponID}`);
    if (box) {
      return box;
    }
    return CPRRolls.rollTypes.ATTACK;
  }

  /**
   * Callback for reseting an actor's death save
   * TODO: the data-value attribute is only used for this method, it is safe to remove it from the templates
   *       and remove the switch statement herein.
   *
   * @callback
   * @private
   * @param {Object} event - object with details of the event
   */
  _resetDeathSave(event) {
    LOGGER.trace("_resetDeathSave | CPRActorSheet | Called.");
    const actorValue = $(event.currentTarget).attr("data-value");
    switch (actorValue) {
      case CPRRolls.rollTypes.DEATHSAVE: {
        this.actor.resetDeathPenalty();
        break;
      }
      default:
    }
  }

  /**
   * Callback for ablating armor
   *
   * @async
   * @private
   * @callback
   * @param {Object} event - object with details of the event
   */
  async _ablateArmor(event) {
    LOGGER.trace("_ablateArmor | CPRActorSheet | Called.");
    const location = $(event.currentTarget).attr("data-location");
    const armorList = this.actor.getEquippedArmors(location);
    const updateList = [];
    let currentArmorValue;
    switch (location) {
      case "head": {
        armorList.forEach((a) => {
          const armorData = a.data;
          const upgradeValue = a.getAllUpgradesFor("headSp");
          const upgradeType = a.getUpgradeTypeFor("headSp");
          armorData.data.headLocation.sp = Number(armorData.data.headLocation.sp);
          armorData.data.headLocation.ablation = Number(armorData.data.headLocation.ablation);
          const armorSp = (upgradeType === "override") ? upgradeValue : armorData.data.headLocation.sp + upgradeValue;
          armorData.data.headLocation.ablation = Math.min(
            (armorData.data.headLocation.ablation + 1), armorSp,
          );
          updateList.push({ _id: a.id, data: armorData.data });
        });
        await this.actor.updateEmbeddedDocuments("Item", updateList);
        // Update actor external data as head armor is ablated:
        currentArmorValue = Math.max((this.actor.data.data.externalData.currentArmorHead.value - 1), 0);
        await this.actor.update({ "data.externalData.currentArmorHead.value": currentArmorValue });
        break;
      }
      case "body": {
        armorList.forEach((a) => {
          const armorData = a.data;
          armorData.data.bodyLocation.sp = Number(armorData.data.bodyLocation.sp);
          armorData.data.bodyLocation.ablation = Number(armorData.data.bodyLocation.ablation);
          const upgradeValue = a.getAllUpgradesFor("bodySp");
          const upgradeType = a.getUpgradeTypeFor("bodySp");
          const armorSp = (upgradeType === "override") ? upgradeValue : armorData.data.bodyLocation.sp + upgradeValue;
          armorData.data.bodyLocation.ablation = Math.min(
            (armorData.data.bodyLocation.ablation + 1), armorSp,
          );
          updateList.push({ _id: a.id, data: armorData.data });
        });
        await this.actor.updateEmbeddedDocuments("Item", updateList);
        // Update actor external data as body armor is ablated:
        currentArmorValue = Math.max((this.actor.data.data.externalData.currentArmorBody.value - 1), 0);
        await this.actor.update({ "data.externalData.currentArmorBody.value": currentArmorValue });
        break;
      }
      case "shield": {
        armorList.forEach((a) => {
          const armorData = a.data;
          armorData.data.shieldHitPoints.value = Number(armorData.data.shieldHitPoints.value);
          armorData.data.shieldHitPoints.max = Number(armorData.data.shieldHitPoints.max);
          armorData.data.shieldHitPoints.value = Math.max((a.getData().shieldHitPoints.value - 1), 0);
          updateList.push({ _id: a.id, data: armorData.data });
        });
        await this.actor.updateEmbeddedDocuments("Item", updateList);
        // Update actor external data as shield is damaged:
        currentArmorValue = Math.max((this.actor.data.data.externalData.currentArmorShield.value - 1), 0);
        await this.actor.update({ "data.externalData.currentArmorShield.value": currentArmorValue });
        break;
      }
      default:
    }
  }

  /**
   * As a first step to re-organizing the methods to the appropriate, objects (Actor/Item),
   * we filter calls to manipulate items through here.  Things such as:
   *  Weapon: Load, Unload
   *  Armor: Ablate, Repair
   *
   * @async
   * @private
   * @callback
   * @param {event} event - object capturing event data (what was clicked and where?)
   */
  async _itemAction(event) {
    LOGGER.trace("_itemAction | CPRActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const actionType = $(event.currentTarget).attr("data-action-type");
    if (item) {
      switch (actionType) {
        case "delete": {
          await this._deleteOwnedItem(item);
          break;
        }
        case "ablate-armor": {
          item.ablateArmor();
          break;
        }
        case "favorite": {
          item.toggleFavorite();
          break;
        }
        case "upgrade": {
          await item.sheet._selectItemUpgrades(event);
          break;
        }
        case "split": {
          this._splitItem(item);
          break;
        }
        default: {
          item.doAction(this.actor, event.currentTarget.attributes);
        }
      }
      // Only update if we aren't deleting the item.  Item deletion is handled in this._deleteOwnedItem()
      if (actionType !== "delete") {
        this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, data: item.data.data }]);
      }
    }
  }

  /**
   * This is the callback for setting armor as "current", which is the star glyph. Setting this enables
   * the SP of the armor to be tracked as a resource bar on the corresponding token.
   *
   * @callback
   * @private
   * @param {} event - object capturing event data (what was clicked and where?)
   */
  _makeArmorCurrent(event) {
    LOGGER.trace("ActorID _makeArmorCurrent | CPRActorSheet | Called.");
    const location = $(event.currentTarget).attr("data-location");
    const id = $(event.currentTarget).attr("data-item-id");
    this.actor.makeThisArmorCurrent(location, id);
  }

  /**
   * Update a property of an Item that is owned by this actor. There is a round trip to the
   * Foundry server with this call, so do not over use it.
   *
   * @private
   * @param {Item} item - object to be updated
   * @param {String} prop - property to be updated in a dot notation (e.g. "item.data.name")
   * @param {*} value - value to set the property to
   */
  _updateOwnedItemProp(item, prop, value) {
    LOGGER.trace("_updateOwnedItemProp | CPRActorSheet | Called.");
    setProperty(item.data, prop, value);
    this._updateOwnedItem(item);
  }

  /**
   * Update an Item owned by this actor. There is a round trip to the Foundry server with this
   * call, so do not over use it in your code.
   *
   * @private
   * @param {Item} item - the updated object to replace in-line
   * @returns - the updated object (document) or array of entities
   */
  _updateOwnedItem(item) {
    LOGGER.trace("_updateOwnedItem | CPRActorSheet | Called.");
    return this.actor.updateEmbeddedDocuments("Item", [{ _id: item.id, data: item.data.data }]);
  }

  /**
   * Render the item card (chat message) when ctrl-click happens on an item link, or display
   * the item sheet if ctrl was not pressed.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _renderItemCard(event) {
    LOGGER.trace("_renderItemCard | CPRActorSheet | Called.");
    const itemId = CPRActorSheet._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
    if (event.ctrlKey) {
      CPRChat.RenderItemCard(item);
    } else {
      item.sheet.render(true, { editable: true });
    }
  }

  /**
   * Render an item sheet in read-only mode, which is used on installed cyberware. This is to
   * prevent a user from editing data while it is installed, such as the foundation type.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _renderReadOnlyItemCard(event) {
    LOGGER.trace("_renderReadOnlyItemCard | CPRActorSheet | Called.");
    const itemId = CPRActorSheet._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
    item.sheet.render(true, { editable: false });
  }

  /**
   * Get an itemId if specified as an attribute of a clicked link.
   * TODO: this may belong in a cpr-templateutils.js library
   *
   * @private
   * @static
   * @param {Object} event - the event object to inspect
   * @returns {String} - the string Id of the item
   */
  static _getItemId(event) {
    LOGGER.trace("_getItemId | CPRActorSheet | Called.");
    let id = $(event.currentTarget).parents(".item").attr("data-item-id");
    if (typeof id === "undefined") {
      LOGGER.debug("Could not find itemId in parent elements, trying currentTarget");
      id = $(event.currentTarget).attr("data-item-id");
    }
    return id;
  }

  /**
   * Return an owned Item object given the desired ID
   *
   * @private
   * @param {String} itemId - the Id of the owned item to retrieve
   * @returns the Item object matching the given Id
   */
  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id === itemId);
  }

  /**
   * Often clickable elements in a sheet reference a complex object on the actor or item.
   * When a property deep in the object needs to be retrieved, a "property-string" is provided
   * for use with the object. This method retrieve that property-string from an attribute in
   * the link. Therefore this method is often pared with _getItemId since it is the first step
   * to getting the object with the property we want.
   *
   * TODO: this may belong in a cpr-templateutils.js library
   *
   * @private
   * @static
   * @param {Object} event - the event object to inspect
   * @returns {String} - the property string
   */
  static _getObjProp(event) {
    return $(event.currentTarget).attr("data-item-prop");
  }

  /**
   * Delete an Item owned by the actor.
   *
   * @private
   * @async
   * @param {Item} item - the item to be deleted
   * @param {Boolean} skipConfirm - bypass rendering the confirmation dialog box
   * @returns {null}
   */
  async _deleteOwnedItem(item, skipConfirm = false) {
    LOGGER.trace("_deleteOwnedItem | CPRActorSheet | Called.");
    // There's a bug here somewhere.  If the prompt is disabled, it doesn't seem
    // to delete, but if the player is prompted, it deletes fine???
    const setting = game.settings.get("cyberpunk-red-core", "deleteItemConfirmation");
    // Only show the delete confirmation if the setting is on, and internally we do not want to skip it.
    if (setting && !skipConfirm) {
      const promptMessage = `${SystemUtils.Localize("CPR.dialog.deleteConfirmation.message")} ${item.data.name}?`;
      const confirmDelete = await ConfirmPrompt.RenderPrompt(
        SystemUtils.Localize("CPR.dialog.deleteConfirmation.title"), promptMessage,
      ).catch((err) => LOGGER.debug(err));
      if (confirmDelete === undefined) {
        return;
      }
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
          if (weaponData.magazine.ammoId === item.id) {
            const warningMessage = `${game.i18n.localize("CPR.messages.ammoDeleteWarning")}: ${weapon.name}`;
            SystemUtils.DisplayMessage("warn", warningMessage);
            ammoIsLoaded = true;
          }
        }
      });

      if (ammoIsLoaded) {
        return;
      }
    }
    if (item.type === "cyberdeck") {
      // Set all of the owned programs that were installed on
      // this cyberdeck to uninstalled.
      const programs = item.getInstalledPrograms();
      const updateList = [];
      programs.forEach((p) => {
        updateList.push({ _id: p._id, "data.isInstalled": false });
      });
      await this.actor.updateEmbeddedDocuments("Item", updateList);
    }

    if (game.system.template.Item[item.type].templates.includes("upgradable")) {
      const { upgrades } = item.data.data;
      const updateList = [];
      upgrades.forEach((u) => {
        updateList.push({ _id: u._id, "data.isInstalled": false });
      });
      await this.actor.updateEmbeddedDocuments("Item", updateList);
    }
    await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
  }

  /**
   * Handle a fire mode checkbox being clicked. This will clear the others and set a Flag on the actor
   * to indicate what was selected when an attack was made. Flags are a Foundry feature on Actors/Items.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _fireCheckboxToggle(event) {
    LOGGER.trace("_fireCheckboxToggle | CPRActorSheet | Called.");
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

  /**
   * Look up the critical injury rollable tables based on name.
   * TODO: revisit whether regexes are the way to go here, and whether this is an actorSheet function
   *
   * @private
   * @returns {Array} - a sorted list of rollable table names that match expectations
   */
  static _getCriticalInjuryTables() {
    LOGGER.trace("_getCriticalInjuryTables | CPRActorSheet | Called.");
    const pattern = "^Critical Injury|^CriticalInjury|^CritInjury|^Crit Injury|^Critical Injuries|^CriticalInjuries";
    const critPattern = new RegExp(pattern);
    const tableNames = [];
    const tableList = game.tables.filter((t) => t.data.name.match(critPattern));
    tableList.forEach((table) => tableNames.push(table.data.name));
    return tableNames.sort();
  }

  /**
   * Pop up a dialog box asking which critical injury table to use and return the user's answer.
   *
   * @private
   * @returns {String} - chosen name of the rollable table to be used for critical injuries
   */
  static async _setCriticalInjuryTable() {
    LOGGER.trace("_setCriticalInjuryTable | CPRActorSheet | Called.");
    const critInjuryTables = CPRActorSheet._getCriticalInjuryTables();
    LOGGER.debugObject(critInjuryTables);
    const formData = await RollCriticalInjuryPrompt.RenderPrompt(critInjuryTables).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return undefined;
    }
    return formData.criticalInjuryTable;
  }

  /**
   * Roll a critical injury. This is the top-level event handler for the sheet.
   *
   * @async
   * @callback
   * @private
   */
  async _rollCriticalInjury() {
    LOGGER.trace("_rollCriticalInjury | CPRActorSheet | Called.");
    const tableName = await CPRActorSheet._setCriticalInjuryTable();
    if (tableName === undefined) {
      return;
    }
    LOGGER.debugObject(tableName);
    const table = game.tables.contents.find((t) => t.name === tableName);
    this._drawCriticalInjuryTable(tableName, table, 0);
    this._automaticResize();
  }

  /**
   * Roll on the given critical injury table. Some heuristics are going on to handle user settings where
   * they do not want duplicate results on a character. When that happens, reroll by recursively calling
   * this method. There is cap to prevent recursing too much or if there are unreachable entries on the
   * table.
   *
   * @param {String} tableName - the name of the table to roll on
   * @param {RollTable} table - the rollable table to draw from (roll on)
   * @param {Number} iteration - iteration #, used to track how many times we have rolled to bail if too many
   * @returns {null}
   */
  async _drawCriticalInjuryTable(tableName, table, iteration) {
    LOGGER.trace("_drawCriticalInjuryTable | CPRActorSheet | Called.");
    if (iteration > 100) {
      // 6% chance to reach here in case of only one rare critical injury remaining (2 or 12 on 2d6)
      LOGGER.debug(table);
      const crit = game.items.find((item) => (
        (item.type === "criticalInjury") && (item.name === table.data.results._source[0].text)
      ));
      if (!crit) {
        SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.dialog.rollCriticalInjury.criticalInjuryNoneWarning")));
        return;
      }
      const critType = crit.data.data.location;
      LOGGER.debug(`critType is ${critType}`);
      let numberCritInjurySameType = 0;
      this.actor.data.filteredItems.criticalInjury.forEach((injury) => {
        if (injury.data.data.location === critType) { numberCritInjurySameType += 1; }
      });
      if (table.data.results.contents.length <= numberCritInjurySameType) {
        SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.messages.criticalInjuryDuplicateAllWarning")));
        return;
      }
      // Techincally possible to reach even if a critical injury is still missing (chance: 6*10e-11 %), though unlikely.
      if (iteration > 1000) {
        SystemUtils.DisplayMessage("error", (game.i18n.localize("CPR.messages.criticalInjuryDuplicateLoopWarning")));
        // Prevent endless loop in case of mixed (head and body) Critical Injury tables
        // or unreachable elements in the rolltable.
        return;
      }
    }
    table.draw({ displayChat: false })
      .then(async (res) => {
        if (res.results.length > 0) {
          // Check if the critical Injury already exists on the character
          let injuryAlreadyExists = false;
          this.actor.data.filteredItems.criticalInjury.forEach((injury) => {
            if (injury.data.name === res.results[0].data.text) { injuryAlreadyExists = true; }
          });
          if (injuryAlreadyExists) {
            const setting = game.settings.get("cyberpunk-red-core", "preventDuplicateCriticalInjuries");
            if (setting === "reroll") {
              this._drawCriticalInjuryTable(tableName, table, iteration + 1);
              return;
            }
            if (setting === "warn") {
              SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.messages.criticalInjuryDuplicateWarning")));
            }
          }
          const crit = game.items.find((item) => (
            (item.type === "criticalInjury") && (item.name === res.results[0].data.text)
          ));
          if (!crit) {
            SystemUtils.DisplayMessage("warn", (game.i18n.localize("CPR.dialog.rollCriticalInjury.criticalInjuryNoneWarning")));
            return;
          }
          const itemData = duplicate(crit.data);
          const result = await this.actor.createEmbeddedDocuments("Item", [itemData]);
          const cprRoll = new CPRRolls.CPRTableRoll(
            crit.data.name, res.roll, "systems/cyberpunk-red-core/templates/chat/cpr-critical-injury-rollcard.hbs",
          );
          cprRoll.rollCardExtraArgs.tableName = tableName;
          cprRoll.rollCardExtraArgs.itemName = result[0].name;
          cprRoll.rollCardExtraArgs.itemImg = result[0].img;
          if (this.token) {
            cprRoll.entityData = { actor: this.actor.id, token: this.token.id, item: result[0].id };
          } else {
            cprRoll.entityData = { actor: this.actor.id, item: result[0].id };
          }
          CPRChat.RenderRollCard(cprRoll);
        }
      });
  }

  /**
   * Automatically resize the actor sheet to dimensions that will fit all revealed elements, assuming the
   * user has this set to happen in their settings.
   *
   * @private
   */
  _automaticResize() {
    LOGGER.trace("ActorSheet | _automaticResize | Called.");
    const setting = game.settings.get("cyberpunk-red-core", "automaticallyResizeSheets");
    if (setting && this.rendered && !this._minimized) {
      // It seems that the size of the content does not change immediately upon updating the content
      setTimeout(() => {
        // Make sheet small, so this.form.offsetHeight does not include whitespace
        this.setPosition({ width: this.position.width, height: 35 });
        // 30px for the header and 8px top margin 8px bottom margin
        this.setPosition({ width: this.position.width, height: this.form.offsetHeight + 46 });
      }, 10);
    }
  }

  /* Ledger methods */

  /**
   * Set the EB on the actor to a specific value, with a reason.
   *
   * @private
   * @param {Number} value - the value to set Eb to
   * @param {String} reason - a freeform comment of why the Eb is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _setEb(value, reason) {
    LOGGER.trace("_setEb | CPRActorSheet | called.");
    return this.actor.setLedgerProperty("wealth", value, reason);
  }

  /**
   * Increase EB by an amount, with a reason
   *
   * @private
   * @param {Number} value - the value to increase Eb by
   * @param {String} reason - a freeform comment of why the Eb is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _gainEb(value, reason) {
    LOGGER.trace("_gainEb | CPRActorSheet | called.");
    return this.actor.deltaLedgerProperty("wealth", value, reason);
  }

  /**
   * Reduce EB by an amount, with a reason
   *
   * @private
   * @param {Number} value - the value to reduce Eb to
   * @param {String} reason - a freeform comment of why the Eb is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _loseEb(value, reason) {
    LOGGER.trace("_loseEb | CPRActorSheet | called.");
    let tempVal = value;
    if (tempVal > 0) {
      tempVal = -tempVal;
    }
    const ledgerProp = this.actor.deltaLedgerProperty("wealth", tempVal, reason);
    Rules.lawyer(ledgerProp.value > 0, "CPR.messages.warningNotEnoughEb");
    return ledgerProp;
  }

  /**
   * Provide an Array of values and reasons the EB has changed. Together this is the "ledger", a
   * collection of records for EB changes.
   *
   * @private
   * @returns {Array} - the records
   */
  _listEbRecords() {
    LOGGER.trace("_listEbRecords | CPRActorSheet | called.");
    return this.actor.listRecords("wealth");
  }

  /**
   * Clear all EB records, effectively setting it back to 0.
   *
   * @private
   * @returns - any empty Array, or null if unsuccessful
   */
  _clearEbRecords() {
    LOGGER.trace("_clearEbRecords | CPRActorSheet | called.");
    return this.actor.clearLedger("wealth");
  }

  /**
   * Set the Points on the actor to a specific value, with a reason.
   *
   * @private
   * @param {Number} value - the value to set IP to
   * @param {String} reason - a freeform comment of why the IP is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _setIp(value, reason) {
    LOGGER.trace("_setIp | CPRActorSheet | called.");
    LOGGER.debug(`setting IP to ${value}`);
    return this.actor.setLedgerProperty("improvementPoints", value, reason);
  }

  /**
   * Increase ImprovementPoints by an amount, with a reason
   *
   * @private
   * @param {Number} value - the value to increase IP by
   * @param {String} reason - a freeform comment of why the IP is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _gainIp(value, reason) {
    LOGGER.trace("_gainIp | CPRActorSheet | called.");
    return this.actor.deltaLedgerProperty("improvementPoints", value, reason);
  }

  /**
   * Reduce ImprovementPoints by an amount, with a reason
   *
   * @private
   * @param {Number} value - the value to reduce IP to
   * @param {String} reason - a freeform comment of why the IP is changing to the given value
   * @returns - the modified property or null if it was unsuccessful
   */
  _loseIp(value, reason) {
    LOGGER.trace("_loseIp | CPRActorSheet | called.");
    let tempVal = value;
    if (tempVal > 0) {
      tempVal = -tempVal;
    }
    const ledgerProp = this.actor.deltaLedgerProperty("improvementPoints", tempVal, reason);
    Rules.lawyer(ledgerProp.value > 0, "CPR.messages.warningNotEnoughIp");
    return ledgerProp;
  }

  /**
   * Provide an Array of values and reasons IP has changed. Together this is the "ledger", a
   * collection of records for IP changes.
   *
   * @private
   * @returns {Array} - the records
   */
  _listIpRecords() {
    LOGGER.trace("_listIpRecords | CPRActorSheet | called.");
    return this.actor.listRecords("improvementPoints");
  }

  /**
   * Clear all IP records, effectively setting it back to 0.
   *
   * @private
   * @returns - any empty Array, or null if unsuccessful
   */
  _clearIpRecords() {
    LOGGER.trace("_clearIpRecords | CPRActorSheet | called.");
    return this.actor.clearLedger("improvementPoints");
  }

  /**
   * Called when an Item is dragged on the ActorSheet. This "stringifies" the Item into attributes
   * that can be inspected later. Doing so allows the system to make changes to the item before/after it
   * is added to the Actor's inventory.
   *
   * @private
   * @param {Object} event - an object capturing event details
   */
  _onDragItemStart(event) {
    LOGGER.trace("_onDragItemStart | CPRActorSheet | called.");
    const itemId = event.currentTarget.getAttribute("data-item-id");
    const item = this.actor.getEmbeddedDocument("Item", itemId);
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      actorId: this.actor.id,
      data: item,
      root: event.currentTarget.getAttribute("root"),
    }));
  }

  /**
   * _onDrop is provided by Foundry and extended here. When an Item is dragged to an ActorSheet a new copy is created.
   * This extension ensure that the copy is owned by the right actor afterward. In the case that an item is dragged from
   * one Actor sheet to another, the item on the source sheet is deleted, simulating an actor giving an item to another
   * actor.
   *
   * @private
   * @override
   * @param {Object} event - an object capturing event details
   * @returns {null}
   */
  async _onDrop(event) {
    LOGGER.trace("_onDrop | CPRActorSheet | called.");
    const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (dragData.actorId !== undefined) {
      // Transfer ownership from one player to another
      const actor = game.actors.find((a) => a.id === dragData.actorId);
      if (actor.type === "container" && !game.user.isGM) {
        SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradeDragOutWarn"));
        return;
      }
      if (actor) {
        if (actor.data._id === this.actor.data._id
          || dragData.data.data.core === true
          || (dragData.data.type === "cyberware" && dragData.data.data.isInstalled)) {
          return;
        }
        if (dragData.data.data.isUpgraded) {
          SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.tradedragupgradewarn"));
          return;
        }
        await super._onDrop(event).then(actor.deleteEmbeddedDocuments("Item", [dragData.data._id]));
      }
    } else {
      await super._onDrop(event);
    }
  }

  /**
   * _splitItem splits an item into multiple items if possible.
   * It also adjusts the price accordingly.
   *
   * @param {Object} item - an object containing the new item
   * @returns {null}
   */
  async _splitItem(item) {
    if (item.data.data.upgrades.length !== 0) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Format("CPR.dialog.splitItem.warningUpgrade"));
    }
    const itemText = SystemUtils.Format("CPR.dialog.splitItem.text",
      { amount: item.data.data.amount, itemName: item.name });
    const formData = await SplitItemPrompt.RenderPrompt(itemText).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    const oldAmount = parseInt(item.data.data.amount, 10);
    const oldPrice = item.data.data.price.market;
    if (formData.splitAmount <= 0 || formData.splitAmount >= oldAmount) {
      const warningMessage = SystemUtils.Format("CPR.dialog.splitItem.warningAmount",
        { amountSplit: formData.splitAmount, amountOld: oldAmount, itemName: item.name });
      SystemUtils.DisplayMessage("warn", warningMessage);
      return;
    }
    const newAmount = oldAmount - formData.splitAmount;
    const newPrice = (oldPrice / oldAmount) * newAmount;
    const newItemData = duplicate(item.data);
    newItemData.data.amount = formData.splitAmount.toString();
    newItemData.data.price.market = formData.splitAmount * (oldPrice / oldAmount);
    delete newItemData._id;
    await this.actor.updateEmbeddedDocuments("Item",
      [{ _id: item.id, "data.amount": newAmount.toString(), "data.price.market": newPrice }]);
    await this.actor.createEmbeddedDocuments("Item", [newItemData]);
  }
}
