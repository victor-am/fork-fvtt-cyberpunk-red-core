/* global game mergeObject $ hasProperty duplicate */
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import Rules from "../../utils/cpr-rules.js";
import SelectRolePrompt from "../../dialog/cpr-select-role-prompt.js";
import SetLifepathPrompt from "../../dialog/cpr-set-lifepath-prompt.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import LedgerEditPrompt from "../../dialog/cpr-ledger-edit-prompt.js";

/**
 * Extend the basic CPRActorSheet with Character specific functionality.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {
  /**
   * We extend the constructor to initialize data structures used for tracking parts of the sheet
   * being collapsed or opened, such as skill categories. These structures are later loaded from
   * User Settings if they exist.
   *
   * @constructor
   * @param {*} actor - the actor object associated with this sheet
   * @param {*} options - entity options passed up the chain
   */
  constructor(actor, options) {
    LOGGER.trace("constructor | CPRCharacterActorSheet | Called.");
    super(actor, options);
    this.options.collapsedSections = [];
    const collapsedSections = SystemUtils.GetUserSetting("sheetConfig", "sheetCollapsedSections", this.id);
    if (collapsedSections) {
      this.options.collapsedSections = collapsedSections;
    }
  }

  /**
   * Set default options for character sheets, which include making sure vertical scrollbars do not
   * get reset when re-rendering.
   * See https://foundryvtt.com/api/Application.html for the complete list of options available.
   *
   * @static
   * @override
   */
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRCharacterActorSheet | Called.");
    return mergeObject(super.defaultOptions, {
      template: "systems/cyberpunk-red-core/templates/actor/cpr-character-sheet.hbs",
      tabs: [{ navSelector: ".navtabs-right", contentSelector: ".right-content-section", initial: "skills" },
        { navSelector: ".navtabs-bottom", contentSelector: ".bottom-content-section", initial: "fight" }],
    });
  }

  /**
   * Add listeners specific to the Character sheet. Remember additional listeners are added from the
   * parent class, CPRActor.
   *
   * @param {*} html - the DOM object
   */
  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRCharacterActorSheet | Called.");

    html.find(".navtabs-right").click(() => this._clearContentFilter());

    // calculate max Hp
    html.find(".calculate-hp").click(() => this._setMaxHp());

    // calculate max Hp
    html.find(".calculate-humanity").click(() => this._setMaxHumanity());

    // Cycle equipment status
    html.find(".equip").click((event) => this._cycleEquipState(event));

    // Repair Armor
    html.find(".repair").click((event) => this._repairArmor(event));

    // Install Cyberware
    html.find(".install-remove-cyberware").click((event) => this._installRemoveCyberwareAction(event));

    // Select Roles for Character
    html.find(".select-roles").click(() => this._selectRoles());

    // Set Lifepath for Character
    html.find(".set-lifepath").click(() => this._setLifepath());

    // toggle "favorite" skills and items
    html.find(".toggle-section-visibility").click((event) => this._toggleSectionVisibility(event));

    // toggle the expand/collapse buttons for skill and item categories
    html.find(".expand-button").click((event) => this._expandButton(event));

    if (!this.options.editable) return;
    // Listeners for editable fields under go here. Fields might not be editable because
    // the user viewing the sheet might not have permission to. They may not be the owner.

    // update a skill level
    html.find(".skill-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));

    // update the ammount of an item in the gear tab
    html.find(".amount-input").click((event) => event.target.select()).change((event) => this._updateAmount(event));

    // update a role ability
    html.find(".ability-input").click((event) => event.target.select()).change(
      (event) => this._updateRoleAbility(event),
    );

    // IP related listeners
    html.find(".improvement-points-edit-button").click(() => this._updateIp());
    html.find(".improvement-points-open-ledger").click(() => this.actor.showLedger("improvementPoints"));

    // Listeners for eurobucks (in gear tab)
    html.find(".eurobucks-input-button").click((event) => this._updateEurobucks(event));
    html.find(".eurobucks-open-ledger").click(() => this.actor.showLedger("wealth"));

    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));

    // Fight tab listeners

    // update the amount of loaded ammo in the Fight tab
    html.find(".weapon-input").click((event) => event.target.select()).change((event) => this._updateWeaponAmmo(event));

    // Switch between meat and net fight states
    html.find(".toggle-fight-state").click((event) => this._toggleFightState(event));

    // Execute a program on a Cyberdeck
    html.find(".program-execution").click((event) => this._cyberdeckProgramExecution(event));

    // Install programs on a Cyberdeck
    html.find(".program-install").click((event) => this._cyberdeckProgramInstall(event));

    // Uninstall a program on a Cyberdeck
    html.find(".program-uninstall").click((event) => this._cyberdeckProgramUninstall(event));

    // Effects tab listeners
    // Create Active Effect
    html.find(".effect-control").click((event) => this.manageEffect(event));

    super.activateListeners(html);
  }

  /**
   * Calculate and set the max HP on this actor. Called when the calculator is clicked.
   * If current hp is full and the max changes, we should update the current to match.
   * We assume that to be preferred behavior more often than not.
   *
   * @callback
   * @private
   */
  _setMaxHp() {
    LOGGER.trace("_setMaxHp | CPRCharacterActorSheet | Called.");
    const maxHp = this.actor.calcMaxHp();
    const { hp } = this.actor.system.derivedStats;
    this.actor.update({
      "system.derivedStats.hp.max": maxHp,
      "system.derivedStats.hp.value": hp.max === hp.value ? maxHp : hp.value,
    });
  }

  /**
   * Calls the actor method to calculate and set the max humanity on this actor
   * If current humanity is full and the max changes, we should update the current and EMP to match.
   * We assume that to be preferred behavior more often than not, especially during character creation.
   *
   * @callback
   * @private
   */
  _setMaxHumanity() {
    LOGGER.trace("_setMaxHumanity | CPRCharacterActorSheet | Called.");
    this.actor.setMaxHumanity();
  }

  /**
   * Called when an equipment glyph on the gear tab is clicked. This cycles the equip attribute from
   * from owned to carried to equipped and back to owned.
   *
   * @callback
   * @private
   * @param {} event - object with details of the event
   */
  _cycleEquipState(event) {
    LOGGER.trace("_cycleEquipState | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const prop = CPRActorSheet._getObjProp(event);
    switch (item.system.equipped) {
      case "owned": {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        if (item.type === "weapon") {
          Rules.lawyer(this.actor.canHoldWeapon(item), "CPR.messages.warningTooManyHands");
        }
        if (item.type === "cyberdeck") {
          if (this.actor.hasItemTypeEquipped(item.type)) {
            Rules.lawyer(false, "CPR.messages.errorTooManyCyberdecks");
            this._updateOwnedItemProp(item, prop, "owned");
            break;
          }
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
    this._automaticResize();
  }

  /**
   * Called when a user clicks the repair armor glyph in the gear tab. It only shows
   * up when the armor has been ablated at least once.
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _repairArmor(event) {
    LOGGER.trace("_repairArmor | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const upgradeValue = item.getAllUpgradesFor("shieldHp");
    const upgradeType = item.getUpgradeTypeFor("shieldHp");
    const currentArmorBodyValue = item.system.bodyLocation.sp;
    const currentArmorHeadValue = item.system.headLocation.sp;
    const currentArmorShieldValue = (upgradeType === "override") ? upgradeValue : item.system.shieldHitPoints.max + upgradeValue;
    // XXX: cannot use _getObjProp since we need to update 2 props
    this._updateOwnedItemProp(item, "system.headLocation.ablation", 0);
    this._updateOwnedItemProp(item, "system.bodyLocation.ablation", 0);
    this._updateOwnedItemProp(item, "system.shieldHitPoints.value", currentArmorShieldValue);
    // Update actor external data when armor is repaired:
    if (CPRActorSheet._getItemId(event) === this.actor.system.externalData.currentArmorBody.id) {
      this.actor.update({
        "system.externalData.currentArmorBody.value": currentArmorBodyValue,
      });
    }
    if (CPRActorSheet._getItemId(event) === this.actor.system.externalData.currentArmorHead.id) {
      this.actor.update({
        "system.externalData.currentArmorHead.value": currentArmorHeadValue,
      });
    }
    if (CPRActorSheet._getItemId(event) === this.actor.system.externalData.currentArmorShield.id) {
      this.actor.update({
        "system.externalData.currentArmorShield.value": currentArmorShieldValue,
      });
    }
  }

  /**
   * This callback functions like a toggle switch. Both install and remove glyphs call it, and it
   * flips the field to indicate cyberware is installed or not.
   *
   * @async
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  async _installRemoveCyberwareAction(event) {
    LOGGER.trace("_installRemoveCyberwareAction | CPRCharacterActorSheet | Called.");
    const itemId = CPRActorSheet._getItemId(event);
    const item = this._getOwnedItem(itemId);
    if (item.system.isInstalled) {
      const foundationalId = SystemUtils.GetEventDatum(event, "data-foundational-id");
      this.actor.removeCyberware(itemId, foundationalId);
    } else {
      this.actor.addCyberware(itemId);
    }
  }

  /**
   * Pops up the role selection dialog box and persists the form data (answers) to the actor.
   *
   * @async
   * @callback
   * @private
   * @returns {null}
   */
  async _selectRoles() {
    LOGGER.trace("_selectRoles | CPRCharacterActorSheet | Called.");
    if (this.actor.itemTypes.role.length === 0) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.characterSheet.bottomPane.role.noRolesWarning"));
      return;
    }
    let formData = {
      roles: this.actor.itemTypes.role,
    };
    formData = await SelectRolePrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    this.actor.update({ "system.roleInfo.activeRole": formData.activeRole, "system.roleInfo.activeNetRole": formData.activeNetRole });
  }

  /**
   * Pops up the dialog box to set life path details, and persists the answers to the actor.
   *
   * @callback
   * @private
   * @returns {null}
   */
  async _setLifepath() {
    LOGGER.trace("_setLifepath | CPRCharacterActorSheet | Called.");
    const formData = await SetLifepathPrompt.RenderPrompt(this.actor.system).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    await this.actor.setLifepath(formData);
  }

  /**
   * This is called when the eye glyph is clicked on the skill tab.
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _toggleSectionVisibility(event) {
    LOGGER.trace("_toggleSectionVisibility | CPRCharacterActorSheet | Called.");
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
  }

  /**
   * This is the + or - glyph on the skil and gear tab that hides whole categories of items.
   * It does not hide favorited items.
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _expandButton(event) {
    LOGGER.trace("_expandButton | CPRCharacterActorSheet | Called.");
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
  }

  /**
   * Called when a skill level input field changes. Persists the change to the skill "item"
   * associated with the actor.
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _updateSkill(event) {
    LOGGER.trace("_updateSkill | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    item.setSkillLevel(parseInt(event.target.value, 10));
    this._updateOwnedItem(item);
  }

  /**
   * Called when the amount of loaded ammunition in a weapon in the Fight tab is changed
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _updateWeaponAmmo(event) {
    LOGGER.trace("_updateWeaponAmmo | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const updateType = SystemUtils.GetEventDatum(event, "data-item-prop");
    if (updateType === "system.magazine.value") {
      if (!Number.isNaN(parseInt(event.target.value, 10))) {
        item.setWeaponAmmo(event.target.value);
      } else {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.amountnotnumber"));
      }
    }
    this._updateOwnedItem(item);
  }

  /**
   * Called when the (in-line) ammount of an item in the gear tab changes
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _updateAmount(event) {
    LOGGER.trace("_updateAmount | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    if (!Number.isNaN(parseInt(event.target.value, 10))) {
      item.setItemAmount(event.target.value);
    } else {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.amountNotNumber"));
    }
    this._updateOwnedItem(item);
  }

  /**
   * Called when a role ability is changed in the role tab. Role abilities are not objects unlike skills,
   * so this perists those changes to the actor and adjusts sub skills.
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  async _updateRoleAbility(event) {
    LOGGER.trace("ActorID _updateRoleAbility | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const cprItemData = duplicate(item.system);
    const subskill = SystemUtils.GetEventDatum(event, "data-subskill-name");
    const value = parseInt(event.target.value, 10);
    if (!Number.isNaN(value)) {
      if (hasProperty(cprItemData, "rank")) {
        if (subskill) {
          const updateSubskill = cprItemData.abilities.filter((a) => a.name === subskill);
          if (updateSubskill.length === 1) {
            updateSubskill[0].rank = value;
          } else {
            SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.multipleAbilitiesWithTheSameName"));
          }
        } else {
          cprItemData.rank = value;
        }
        await item.update({ system: cprItemData });
      }
    } else {
      SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.amountNotNumber"));
    }
  }

  /**
   * Create a new active effect for this actor. This sets up all the defaults.
   * Note: It would be nice to add custom properties, but they seem to be ignored by Foundry.
   * This is why we provide a custom CPRActiveEffect object elsewhere in the code base.
   *
   * @async - deleteEffect may pop up a dialog
   * @returns {ActiveEffect} - the newly created or updated document
   */
  async manageEffect(event) {
    LOGGER.trace("manageEffect | CPRCharacterActorSheet | Called.");
    event.preventDefault();
    const action = SystemUtils.GetEventDatum(event, "data-action");
    const effectId = SystemUtils.GetEventDatum(event, "data-effect-id");
    const effect = this.actor.effects.get(effectId);
    switch (action) {
      case "create":
        return this.actor.createEffect();
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        return this.actor.constructor.deleteEffect(effect);
      case "toggle":
        return effect.update({ disabled: !effect.disabled });
      default:
        return null;
    }
  }

  /**
   * Called when the IP editing glyph is clicked. Pops up a dialog to get details about the change
   * and a reason, and then saves those similar to eurobucks.
   *
   * @callback
   * @private
   * @returns {null}
   */
  async _updateIp() {
    LOGGER.trace("_updateIp | CPRCharacterActorSheet | Called.");
    const formData = await LedgerEditPrompt.RenderPrompt("CPR.characterSheet.leftPane.improvementPointsEdit").catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      // Prompt was closed
      return;
    }
    if (formData.changeValue !== null && formData.changeValue !== "") {
      switch (formData.action) {
        case "add": {
          this._gainLedger("improvementPoints", parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        case "subtract": {
          this._loseLedger("improvementPoints", parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        case "set": {
          this._setLedger("improvementPoints", parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        default: {
          SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.improvementPointsEditInvalidAction"));
          break;
        }
      }
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.improvementPointsEditWarn"));
    }
  }

  /**
   * Called when any of the 3 glyphs to change eurobucks is clicked. This saves the change and a reason
   * if provided to the actor in the for of a "ledger."
   *
   * @callback
   * @private
   * @param {*} event - object with details of the event
   */
  _updateEurobucks(event) {
    LOGGER.trace("_updateEurobucks | CPRCharacterActorSheet | Called.");
    const { value } = event.currentTarget.parentElement.parentElement.children[1];
    const reason = event.currentTarget.parentElement.parentElement.nextElementSibling.lastElementChild.value;
    const action = SystemUtils.GetEventDatum(event, "data-action");
    if (value !== "") {
      switch (action) {
        case "add": {
          this._gainLedger("wealth", parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        case "subtract": {
          this._loseLedger("wealth", parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        case "set": {
          this._setLedger("wealth", parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        default: {
          SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.messages.eurobucksModifyInvalidAction"));
          break;
        }
      }
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.messages.eurobucksModifyWarn"));
    }
  }

  /**
   * Create an item in the inventory of the actor. The templates will hide this functionality
   * if the GMs does not want to permit players to create their own items.
   *
   * @private
   * @callback
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  async _createInventoryItem(event) {
    LOGGER.trace("_createInventoryItem | CPRCharacterActorSheet | Called.");
    const itemType = SystemUtils.GetEventDatum(event, "data-item-type");
    const itemTypeNice = itemType.toLowerCase().capitalize();
    const itemString = "ITEM.Type";
    const itemTypeLocal = itemString.concat(itemTypeNice);
    const newWord = SystemUtils.Localize("CPR.actorSheets.commonActions.new");
    const newType = SystemUtils.Localize(itemTypeLocal);
    const itemName = `${newWord} ${newType}`;
    const itemImage = SystemUtils.GetDefaultImage("Item", itemType);
    const itemData = { img: itemImage, name: itemName, type: itemType };
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Create set a flag on the actor of what their current Fight State is which affects
   * what is viewed in the Fight Tab of the character sheet.
   *
   * Currently the two fight states are valid:
   *
   * "Meatspace" - Fight data relative to combat when not "jacked in"
   * "Netspace"  - Fight data relative to combat when "jacked in"
   *
   * @private
   * @param {Object} event - object capturing event data (what was clicked and where?)
   */
  _toggleFightState(event) {
    LOGGER.trace("_toggleFightState | CPRCharacterSheet | Called.");
    const fightState = SystemUtils.GetEventDatum(event, "data-state");
    this.actor.setFlag("cyberpunk-red-core", "fightState", fightState);
  }

  /**
   * A dispatcher method to do things based on what is clicked in the "net" view of
   * the Fight tab. Mostly this is around rez-management of programs.
   *
   * @async
   * @callback
   * @private
   */
  async _cyberdeckProgramExecution(event) {
    LOGGER.trace("_cyberdeckProgramExecution | CPRCharacterActorSheet | Called.");
    const executionType = SystemUtils.GetEventDatum(event, "data-execution-type");
    const programId = SystemUtils.GetEventDatum(event, "data-program-id");
    const program = this._getOwnedItem(programId);
    const cyberdeckId = SystemUtils.GetEventDatum(event, "data-cyberdeck-id");
    const cyberdeck = this._getOwnedItem(cyberdeckId);
    const { token } = this;
    switch (executionType) {
      case "rez": {
        if (!cyberdeck.isRezzed(program)) {
          await cyberdeck.rezProgram(program, token);
          this._updateOwnedItem(cyberdeck);
        }
        break;
      }
      case "derez": {
        if (cyberdeck.isRezzed(program)) {
          await cyberdeck.derezProgram(program);
          this._updateOwnedItem(cyberdeck);
        }
        break;
      }
      case "reduce-rez": {
        if (cyberdeck.isRezzed(program)) {
          await cyberdeck.reduceRezProgram(program);
          this._updateOwnedItem(cyberdeck);
        }
        break;
      }
      case "reset-rez": {
        if (cyberdeck.isRezzed(program)) {
          await cyberdeck.resetRezProgram(program);
          this._updateOwnedItem(cyberdeck);
        }
        break;
      }
      case "atk":
      case "damage":
      case "def": {
        await this._onRoll(event);
        break;
      }
      default:
    }

    const updateList = [];
    if (cyberdeck.isOwned && cyberdeck.isEmbedded) {
      updateList.push({ _id: cyberdeck.id, system: cyberdeck.system });
    }

    if (program.isOwned && program.isEmbedded) {
      updateList.push({ _id: program.id, system: program.system });
    }

    if (updateList.length > 0) {
      this.actor.updateEmbeddedDocuments("Item", updateList);
    }
  }

  /**
   * Pop up a dialog box to select what programs in the character's inventory are installed
   * in an equipped cyberdeck. This information is saved to the cyberdeck Item.
   *
   * @async
   * @callback
   * @private
   * @param {*} event - object capturing event data (what was clicked and where?)
   * @returns {null}
   */
  async _cyberdeckProgramInstall(event) {
    LOGGER.trace("_cyberdeckProgramInstall | CPRCharacterActorSheet | Called.");
    const cyberdeckId = SystemUtils.GetEventDatum(event, "data-item-id");
    const cyberdeck = this._getOwnedItem(cyberdeckId);

    return cyberdeck.sheet._cyberdeckSelectInstalledPrograms(event);
  }

  /**
   * Called when the erase program glyph is clicked (the red folder). Removes the program from
   * the equipped cyberdeck.
   *
   * @param {*} event - object capturing event data (what was clicked and where?)
   * @returns {null}
   */
  async _cyberdeckProgramUninstall(event) {
    LOGGER.trace("_cyberdeckProgramUninstall | CPRCharacterActorSheet | Called.");
    const cyberdeckId = SystemUtils.GetEventDatum(event, "data-cyberdeck-id");
    const cyberdeck = this._getOwnedItem(cyberdeckId);

    return cyberdeck.sheet._cyberdeckProgramUninstall(event);
  }
}
