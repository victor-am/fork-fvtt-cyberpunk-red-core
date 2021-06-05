/* global mergeObject $ getProperty setProperty hasProperty duplicate */
import CPR from "../../system/config.js";
import CPRActorSheet from "./cpr-actor-sheet.js";
import LOGGER from "../../utils/cpr-logger.js";
import Rules from "../../utils/cpr-rules.js";
import SelectRolePrompt from "../../dialog/cpr-select-role-prompt.js";
import SetLifepathPrompt from "../../dialog/cpr-set-lifepath-prompt.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

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

    // create a proper ledger record for IP
    html.find(".ip-input").click((event) => event.target.select()).change((event) => this._updateIp(event));

    // create a proper ledger record for EB
    html.find(".eurobucks-input").click((event) => event.target.select()).change(
      (event) => this._updateEurobucks(event),
    );

    // Create item in inventory
    html.find(".item-create").click((event) => this._createInventoryItem(event));

    super.activateListeners(html);
  }

  _cycleEquipState(event) {
    LOGGER.trace("ActorID _cycleEquipState | CPRActorSheet | Called.");
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
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
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
    LOGGER.trace("ActorID _installCyberware | CPRActorSheet | Called.");
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
    formData = await SelectRolePrompt.RenderPrompt(formData);
    await this.actor.setRoles(formData);
  }

  async _setLifepath() {
    const formData = await SetLifepathPrompt.RenderPrompt(this.actor.data);
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
    LOGGER.trace("ActorID _updateSkill | CPRActorSheet | Called.");
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
    LOGGER.trace("ActorID _updateCurrentWeaponAmmo | CPRActorSheet | Called.");
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
    LOGGER.trace("ActorID _updateAmount | CPRActorSheet | Called.");
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
    LOGGER.trace("ActorID _updateRoleAbility | CPRActorSheet | Called.");
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

  _updateIp(event) {
    LOGGER.trace("ActorID _updateIp | CPRActorSheet | Called.");
    this._setIp(parseInt(event.target.value, 10), "player input in gear tab");
  }

  _updateEurobucks(event) {
    LOGGER.trace("ActorID _updateEurobucks | CPRActorSheet | Called.");
    this._setEb(parseInt(event.target.value, 10), "player input in gear tab");
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
}
