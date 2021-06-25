/* global game mergeObject $ getProperty setProperty hasProperty duplicate */
import CPR from "../../system/config.js";
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import Rules from "../../utils/cpr-rules.js";
import SelectRolePrompt from "../../dialog/cpr-select-role-prompt.js";
import SetLifepathPrompt from "../../dialog/cpr-set-lifepath-prompt.js";
import CyberdeckSelectProgramsPrompt from "../../dialog/cpr-select-install-programs-prompt.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";
import ImprovementPointEditPrompt from "../../dialog/cpr-improvement-point-edit-prompt.js";

/**
 * Extend the basic CPRActorSheet with Character specific functionality.
 * @extends {CPRActorSheet}
 */
export default class CPRCharacterActorSheet extends CPRActorSheet {
  /**
   * We extend the constructor to initialize data structures used for tracking parts of the sheet
   * being collapsed or opened, such as skill categories. These structures are later loaded from
   * User Settings if they exist.
   * @constructor
   * @param {*} actor - the actor object associated with this sheet
   * @param {*} options - entity options passed up the chain
   */
  constructor(actor, options) {
    super(actor, options);
    this.options.collapsedSections = [];
    const collapsedSections = SystemUtils.GetUserSetting("sheetConfig", "sheetCollapsedSections", this.id);
    if (collapsedSections) {
      this.options.collapsedSections = collapsedSections;
    }
  }

  /**
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
    html.find(".toggle-favorite-visibility").click((event) => this._favoriteVisibility(event));

    // toggle the expand/collapse buttons for skill and item categories
    html.find(".expand-button").click((event) => this._expandButton(event));

    // hide skills by category on clicking header
    // for beginners: the unusual signature is because _hideSkill is a static method
    // eslint-disable-next-line no-shadow
    html.find(".skills .header").click((event, html) => CPRCharacterActorSheet._hideSkill(event, html));

    if (!this.options.editable) return;
    // Listeners for editable fields under go here. Fields might not be editable because
    // the user viewing the sheet might not have permission to. They may not be the owner.

    html.find(".skill-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));
    html.find(".weapon-input").click((event) => event.target.select()).change((event) => this._updateWeaponAmmo(event));
    html.find(".amount-input").click((event) => event.target.select()).change((event) => this._updateAmount(event));
    html.find(".ability-input").click((event) => event.target.select()).change(
      (event) => this._updateRoleAbility(event),
    );

    html.find(".improvement-points-edit-button").click(() => this._updateIp());
    html.find(".improvement-points-open-ledger").click(() => this.actor.showLedger("improvementPoints"));
    html.find(".eurobucks-input-button").click((event) => this._updateEurobucks(event));
    html.find(".eurobucks-open-ledger").click(() => this.actor.showLedger("wealth"));

    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));

    // Fight tab listeners

    // Switch between meat and net fight states
    html.find(".toggle-fight-state").click((event) => this._toggleFightState(event));

    // Execute a program on a Cyberdeck
    html.find(".program-execution").click((event) => this._cyberdeckProgramExecution(event));

    // Install programs on a Cyberdeck
    html.find(".program-install").click((event) => this._cyberdeckProgramInstall(event));

    // Uninstall a program on a Cyberdeck
    html.find(".program-uninstall").click((event) => this._cyberdeckProgramUninstall(event));

    super.activateListeners(html);
  }

  _cycleEquipState(event) {
    LOGGER.trace("ActorID _cycleEquipState | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const prop = CPRActorSheet._getObjProp(event);
    switch (item.data.data.equipped) {
      case "owned": {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        if (item.data.type === "weapon") {
          Rules.lawyer(this.actor.canHoldWeapon(item), "CPR.warningtoomanyhands");
        }
        if (item.data.type === "cyberdeck") {
          if (this.actor.hasItemTypeEquipped(item.data.type)) {
            Rules.lawyer(false, "CPR.errortoomanycyberdecks");
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

  _repairArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const currentArmorBodyValue = item.data.data.bodyLocation.sp;
    const currentArmorHeadValue = item.data.data.headLocation.sp;
    const currentArmorShieldValue = item.data.data.shieldHitPoints.max;
    // XXX: cannot use _getObjProp since we need to update 2 props
    this._updateOwnedItemProp(item, "data.headLocation.ablation", 0);
    this._updateOwnedItemProp(item, "data.bodyLocation.ablation", 0);
    this._updateOwnedItemProp(item, "data.shieldHitPoints.value", item.data.data.shieldHitPoints.max);
    // Update actor external data when armor is repaired:
    if (CPRActorSheet._getItemId(event) === this.actor.data.data.externalData.currentArmorBody.id) {
      this.actor.update({
        "data.externalData.currentArmorBody.value": currentArmorBodyValue,
      });
    }
    if (CPRActorSheet._getItemId(event) === this.actor.data.data.externalData.currentArmorHead.id) {
      this.actor.update({
        "data.externalData.currentArmorHead.value": currentArmorHeadValue,
      });
    }
    if (CPRActorSheet._getItemId(event) === this.actor.data.data.externalData.currentArmorShield.id) {
      this.actor.update({
        "data.externalData.currentArmorShield.value": currentArmorShieldValue,
      });
    }
  }

  async _installRemoveCyberwareAction(event) {
    LOGGER.trace("ActorID _installCyberware | CPRCharacterActorSheet | Called.");
    const itemId = CPRActorSheet._getItemId(event);
    const item = this._getOwnedItem(itemId);
    if (item.getData().isInstalled) {
      const foundationalId = $(event.currentTarget).parents(".item").attr("data-foundational-id");
      this.actor.removeCyberware(itemId, foundationalId);
    } else {
      this.actor.addCyberware(itemId);
    }
  }

  async _selectRoles() {
    let formData = { actor: this.actor.getData().roleInfo, roles: CPR.roleList };
    formData = await SelectRolePrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    await this.actor.setRoles(formData);
  }

  async _setLifepath() {
    const formData = await SetLifepathPrompt.RenderPrompt(this.actor.data).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }
    await this.actor.setLifepath(formData);
  }

  _favoriteVisibility(event) {
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

  _expandButton(event) {
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

  static _hideSkill(event, html) {
    const header = $(event.currentTarget);
    const category = header.attr("data-skill-category-name");
    // eslint-disable-next-line no-restricted-syntax
    for (const i of html.find(".row.skill")) {
      if (i.attributes[2].nodeValue === category) {
        // eslint-disable-next-line no-unused-expressions
        i.classList.contains("hide") ? i.classList.remove("hide") : i.classList.add("hide");
      }
    }
  }

  _updateSkill(event) {
    LOGGER.trace("ActorID _updateSkill | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const updateType = $(event.currentTarget).attr("data-item-prop");
    if (updateType === "data.level") {
      item.setSkillLevel(parseInt(event.target.value, 10));
    }
    if (updateType === "data.mod") {
      item.setSkillMod(parseInt(event.target.value, 10));
    }
    this._updateOwnedItem(item);
  }

  _updateWeaponAmmo(event) {
    LOGGER.trace("ActorID _updateCurrentWeaponAmmo | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const updateType = $(event.currentTarget).attr("data-item-prop");
    if (updateType === "data.magazine.value") {
      if (!Number.isNaN(parseInt(event.target.value, 10))) {
        item.setWeaponAmmo(event.target.value);
      } else {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.amountnotnumber"));
      }
    }
    this._updateOwnedItem(item);
  }

  _updateAmount(event) {
    LOGGER.trace("ActorID _updateAmount | CPRCharacterActorSheet | Called.");
    const item = this._getOwnedItem(CPRActorSheet._getItemId(event));
    const updateType = $(event.currentTarget).attr("data-item-prop");
    if (updateType === "item.data.amount") {
      if (!Number.isNaN(parseInt(event.target.value, 10))) {
        item.setItemAmount(event.target.value);
      } else {
        SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.amountnotnumber"));
      }
    }
    this._updateOwnedItem(item);
  }

  _updateRoleAbility(event) {
    LOGGER.trace("ActorID _updateRoleAbility | CPRCharacterActorSheet | Called.");
    const role = $(event.currentTarget).attr("data-role-name");
    const ability = $(event.currentTarget).attr("data-ability-name");
    const subskill = $(event.currentTarget).attr("data-subskill-name");
    const value = parseInt(event.target.value, 10);
    const actorData = duplicate(this.actor.data);
    if (hasProperty(actorData, "data.roleInfo")) {
      const prop = getProperty(actorData, "data.roleInfo");
      if (subskill) {
        prop.roleskills[role].subSkills[subskill] = value;
      } else {
        prop.roleskills[role][ability] = value;
      }
      setProperty(actorData, "data.roleInfo", prop);
      this.actor.update(actorData);
    }
  }

  async _updateIp() {
    LOGGER.trace("ActorID _updateIp | CPRCharacterActorSheet | Called.");
    const formData = await ImprovementPointEditPrompt.RenderPrompt().catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      // Prompt was closed
      return;
    }
    if (formData.changeValue !== null && formData.changeValue !== "") {
      switch (formData.action) {
        case "add": {
          this._gainIp(parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        case "subtract": {
          this._loseIp(parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        case "set": {
          this._setIp(parseInt(formData.changeValue, 10), `${formData.changeReason} - ${game.user.name}`);
          break;
        }
        default: {
          SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.improvementpointseditinvalidaction"));
          break;
        }
      }
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.improvementpointseditwarn"));
    }
  }

  _updateEurobucks(event) {
    LOGGER.trace("ActorID _updateEurobucks | CPRCharacterActorSheet | Called.");
    const { value } = event.currentTarget.parentElement.parentElement.children[1];
    const reason = event.currentTarget.parentElement.parentElement.nextElementSibling.lastElementChild.value;
    const action = $(event.currentTarget).attr("data-action");
    if (value !== "") {
      switch (action) {
        case "add": {
          this._gainEb(parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        case "subtract": {
          this._loseEb(parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        case "set": {
          this._setEb(parseInt(value, 10), `${reason} - ${game.user.name}`);
          break;
        }
        default: {
          SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.eurobucksmodifyinvalidaction"));
          break;
        }
      }
    } else {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.eurobucksmodifywarn"));
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
    LOGGER.trace("_createInventoryItem | CPRActorSheet | Called.");
    const itemType = $(event.currentTarget).attr("data-item-type");
    const itemTypeNice = itemType.toLowerCase().capitalize();
    const itemString = "ITEM.Type";
    const itemTypeLocal = itemString.concat(itemTypeNice);
    const itemName = `${SystemUtils.Localize("CPR.new")} ${SystemUtils.Localize(itemTypeLocal)}`;
    const itemData = { name: itemName, type: itemType };
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
    LOGGER.trace("_toggleFightState | CPRActorSheet | Called.");
    const fightState = $(event.currentTarget).attr("data-state");
    this.actor.setFlag("cyberpunk-red-core", "fightState", fightState);
  }

  async _cyberdeckProgramExecution(event) {
    const executionType = $(event.currentTarget).attr("data-execution-type");
    const programId = $(event.currentTarget).attr("data-program-id");
    const program = this._getOwnedItem(programId);
    const cyberdeckId = $(event.currentTarget).attr("data-cyberdeck-id");
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
      updateList.push({ _id: cyberdeck.id, data: cyberdeck.data.data });
    }

    if (program.isOwned && program.isEmbedded) {
      updateList.push({ _id: program.id, data: program.data.data });
    }

    if (updateList.length > 0) {
      this.actor.updateEmbeddedDocuments("Item", updateList);
    }
  }

  async _cyberdeckProgramInstall(event) {
    LOGGER.debug("_cyberdeckProgramInstall | CPRItem | Called.");
    const cyberdeckId = $(event.currentTarget).attr("data-item-id");
    const cyberdeck = this._getOwnedItem(cyberdeckId);

    const { actor } = this;

    // Get a list of programs that are installed on this cyberdeck
    const installedPrograms = cyberdeck.getInstalledPrograms();

    // Prepare a list of programs for the prompt to select from
    let programList = [];

    // Start with the list of all programs owned by the actor
    programList = actor.data.filteredItems.program;

    // Remove all programs that are installed somewhere other than this deck
    actor.data.filteredItems.programsInstalled.forEach((programId) => {
      const onDeck = installedPrograms.filter((p) => p._id === programId);
      if (onDeck.length === 0) {
        programList = programList.filter((p) => p.id !== programId);
      }
    });

    programList = programList.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

    let formData = {
      cyberdeck,
      programList,
      returnType: "array",
    };

    formData = await CyberdeckSelectProgramsPrompt.RenderPrompt(formData).catch((err) => LOGGER.debug(err));
    if (formData === undefined) {
      return;
    }

    let selectedPrograms = [];
    let unselectedPrograms = programList;

    let storageRequired = 0;

    formData.selectedPrograms.forEach((pId) => {
      const program = (programList.filter((p) => p.data._id === pId))[0];
      storageRequired += program.data.data.slots;
      selectedPrograms.push(program);
      unselectedPrograms = unselectedPrograms.filter((p) => p.data._id !== program.data._id);
    });

    selectedPrograms = selectedPrograms.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));
    unselectedPrograms = unselectedPrograms.sort((a, b) => (a.data.name > b.data.name ? 1 : -1));

    if (storageRequired > cyberdeck.data.data.slots) {
      SystemUtils.DisplayMessage("warn", "CPR.cyberdeckinsufficientstorage");
    }

    cyberdeck.uninstallPrograms(unselectedPrograms);
    cyberdeck.installPrograms(selectedPrograms);

    const updateList = [{ _id: cyberdeck.id, data: cyberdeck.data.data }];
    programList.forEach((program) => {
      updateList.push({ _id: program.id, data: program.data.data });
    });
    await actor.updateEmbeddedDocuments("Item", updateList);
  }

  async _cyberdeckProgramUninstall(event) {
    LOGGER.debug("_cyberdeckProgramUninstall | CPRItem | Called.");
    const programId = $(event.currentTarget).attr("data-item-id");
    const program = this._getOwnedItem(programId);
    const cyberdeckId = $(event.currentTarget).attr("data-cyberdeck-id");
    const cyberdeck = this._getOwnedItem(cyberdeckId);

    if (cyberdeck.data.type !== "cyberdeck") {
      return;
    }

    const { actor } = this;

    if (!actor) {
      SystemUtils.DisplayMessage("warn", SystemUtils.Localize("CPR.owneditemonlyerror"));
      return;
    }

    cyberdeck.uninstallPrograms([program]);

    const updateList = [{ _id: cyberdeck.data._id, data: cyberdeck.data.data }];
    updateList.push({ _id: program.data._id, "data.isInstalled": false });
    await actor.updateEmbeddedDocuments("Item", updateList);
  }
}
