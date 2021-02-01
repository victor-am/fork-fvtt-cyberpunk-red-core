/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* global ActorSheet */
/* global mergeObject, $, setProperty, game */
/* eslint no-prototype-builtins: ["warn"] */
import LOGGER from "../../utils/cpr-logger.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import CPRRollRequest from "../../rolls/cpr-roll-request.js";
import VerifyRoll from "../../dialog/cpr-verify-roll-prompt.js";
import CPRChat from "../../chat/cpr-chat.js";
import Rules from "../../utils/cpr-rules.js";
import InstallCyberwarePrompt from "../../dialog/cpr-cyberware-install-prompt.js";
import ConfirmPrompt from "../../dialog/cpr-confirmation-prompt.js";
import SelectRolePrompt from "../../dialog/cpr-select-role-prompt.js";
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
      width: 600,
      height: 706,
      scrollY: [".content-container"],
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
        $(currentTarget).click();
        $(currentTarget).find(".collapse-icon").removeClass("hide");
        console.log($(currentTarget));
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
    data.installedCyberware = this._getInstalledCyberware();
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    $("input[type=text]").focusin(() => $(this).select());

    // Make a roll
    html.find(".rollable").click((event) => this._onRoll(event));

    // Cycle equipment status
    html.find(".equip").click((event) => this._cycleEquipState(event));

    // Repair Armor
    html.find(".repair").click((event) => this._repairArmor(event));

    // Ablate Armor
    html.find(".ablate").click((event) => this._ablateArmor(event));

    // Install Cyberware
    html.find(".install").click((event) => this._installCyberwareAction(event));

    // Uninstall Cyberware
    html.find(".uninstall").click((event) => this._uninstallCyberwareAction(event));

    // Generic item action
    html.find(".item-action").click((event) => this._itemAction(event));

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    // Select Roles for Character
    html.find(".select-roles").click((event) => this._selectRoles(event));

    html.find(".checkbox").click((event) => this._checkboxToggle(event));

    html.find(".skill-level-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));

    html.find(".expand-button").click((event) => {
      if ($(event.currentTarget.parentElement).hasClass("collapsible")) {
        $(event.currentTarget).find(".collapse-icon").toggleClass("hide");
        for (let i = 0; i < event.currentTarget.parentElement.childNodes.length; i += 1) {
          if ($(event.currentTarget.parentElement.childNodes[i]).hasClass("item")) {
            $(event.currentTarget.parentElement.childNodes[i]).toggleClass("hide");
            if ($(event.currentTarget.parentElement.childNodes[i]).hasClass("hide")) {
              if (!this.options.collapsedSections.includes(event.currentTarget.id)) {
                this.options.collapsedSections.push(event.currentTarget.id);
                console.log(this.options.collapsedSections);
              }
            } else {
              this.options.collapsedSections = this.options.collapsedSections.filter((sectionName) => sectionName !== event.currentTarget.id);
            }
          }
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
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace("ActorID _onRoll | CPRActorSheet | Called.");

    const rollRequest = new CPRRollRequest(event);

    // Prepare data relative to the roll type
    switch (rollRequest.rollType) {
      case "stat": {
        this._prepareRollStat(rollRequest);
        break;
      }
      case "skill": {
        const itemId = this._getItemId(event);
        this._prepareRollSkill(rollRequest, itemId);
        break;
      }
      case "roleAbility": {
        this._prepareRollAbility(rollRequest);
        break;
      }
      case "attack": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        rollRequest.isAimed = $(event.currentTarget).attr("data-aimed");
        this._prepareRollAttack(rollRequest, itemId);
        break;
      }
      case "damage": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        this._prepareRollDamage(rollRequest, itemId);
        break;
      }
      default:
    }

    // Handle skipping of the user verification step
    if (!event.ctrlKey) {
      // TODO - Charles save us....
      const formData = await VerifyRoll.RenderPrompt(rollRequest);
      mergeObject(rollRequest, formData, { overwrite: true });
    }

    // TODO - Is this ideal for handling breaking out of the roll on cancel from verifyRollPrompt
    // Handle exiting without making a roll or affecting any entitiy state.
    if (rollRequest.rollType === "abort") {
      return;
    }

    // If this is an attack roll and they did not cancel it
    // via the VerifyRollPrompt, and it is ranged, we should
    // decrement the ammo for the weapon. We can't do this in
    // the prepareRollAttack because they might abort it.
    if (rollRequest.rollType === "attack") {
      if (rollRequest.isRanged) {
        const weaponId = $(event.currentTarget).attr("data-item-id");
        const weaponItem = this.actor.items.find((i) => i.data._id === weaponId);
        weaponItem.fireRangedWeapon(rollRequest.fireMode);
      }
    }

    // Damage
    // CPRChat.RenderRollCard(CPRRolls.HandleRoll(rollRequest));
    if (rollRequest.rollType === "damage") {
      CPRChat.RenderRollCard(await CPRRolls.DamageRoll(rollRequest));
    } else {
      // outputs to chat
      CPRChat.RenderRollCard(await CPRRolls.BaseRoll(rollRequest));
    }
  }

  // PREPARE ROLLS
  _prepareRollStat(rollRequest) {
    rollRequest.stat = rollRequest.rollTitle;
    rollRequest.statValue = this.getData().data.stats[rollRequest.rollTitle].value;
    rollRequest.mods.push(this._getArmorPenaltyMods(rollRequest.stat));
    LOGGER.trace(`ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
  }

  _prepareRollSkill(rollRequest, itemId) {
    LOGGER.trace(`ActorID _prepareRollSkill | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`);
    const item = this._getOwnedItem(itemId);
    rollRequest.stat = item.getData().stat;
    rollRequest.statValue = this.getData().data.stats[item.getData().stat].value;
    rollRequest.skill = item.name;
    rollRequest.skillValue = item.getData().level;
    // TODO: Do not remove functionality during a refactor. Adding in until a "better way"
    // is implemented.
    // Armor pen should apply directly to stat, not be fetched.
    rollRequest.mods.push(this._getArmorPenaltyMods(item.getData().stat));
  }

  // TODO - Revisit / Refactor
  _prepareRollAbility(rollRequest) {
    LOGGER.trace(`ActorID _prepareRollAbility | rolling ability: ${rollRequest.rollTitle} | ${rollRequest.skillValue}`);
    const { roleskills: roles } = this.getData().data.roleInfo;
    const roleAbility = rollRequest.rollTitle;
    Object.keys(roles).forEach((roleName) => {
      if (Object.prototype.hasOwnProperty.call(roles[roleName], roleAbility)) {
        rollRequest.roleValue = roles[roleName][roleAbility];
        rollRequest.rollTitle = SystemUtils.Localize(CPR.roleAbilityList[roleAbility]);
      }
      if (!rollRequest.roleValue && roles[roleName].subSkills) {
        // If not found, check subSkills
        if (Object.prototype.hasOwnProperty.call(roles[roleName].subSkills, roleAbility)) {
          rollRequest.roleValue = roles[roleName].subSkills[roleAbility];
          rollRequest.rollTitle = SystemUtils.Localize(CPR.roleAbilityList[roleAbility]);
        }
      }
    });
  }

  _prepareRollAttack(rollRequest, itemId) {
    const weaponItem = this._getOwnedItem(itemId);
    rollRequest.rollTitle = weaponItem.data.name;
    rollRequest.isRanged = weaponItem.getData().isRanged;
    if (rollRequest.isRanged) {
      rollRequest.stat = "ref";
      rollRequest.statValue = this.getData().data.stats.ref.value;
    } else {
      rollRequest.stat = "dex";
      rollRequest.statValue = this.getData().data.stats.dex.value;
    }

    // DIVEST!
    // TEMP: For now we will get the mods like so, but ideally we would have a
    // single function that would compile mods from all sources.
    if (weaponItem.getData().quality === "excellent") {
      rollRequest.mods.push(1);
    }

    if (rollRequest.isAimed) {
      rollRequest.mods.push(-8);
    }

    // if char owns relevant skill, get skill value, else assign None: 0
    const skillItem = this.actor.items.find((i) => i.name === weaponItem.getData().weaponSkill);
    if (skillItem) {
      rollRequest.skillValue = skillItem.getData().level;
      rollRequest.skill = skillItem.data.name;
    } else {
      rollRequest.skillValue = 0;
      rollRequest.skill = "None";
    }
    LOGGER.trace(`Actor _prepareRollAttack | rolling attack | skillName: ${skillItem.name} skillValue: ${rollRequest.skillValue} statValue: ${rollRequest.statValue}`);
  }

  _prepareRollDamage(rollRequest, itemId) {
    const weaponItem = this._getOwnedItem(itemId);
    rollRequest.rollTitle = weaponItem.data.name;
    rollRequest.formula = weaponItem.getData().damage;
    rollRequest.attackSkill = weaponItem.getData().weaponSkill;
    rollRequest.weaponType = weaponItem.getData().weaponType;
  }

  _repairArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    // XXX: cannot use _getObjProp since we need to update 2 props
    this._updateOwnedItemProp(item, "data.headLocation.ablation", 0);
    this._updateOwnedItemProp(item, "data.bodyLocation.ablation", 0);
  }

  _ablateArmor(event) {
    LOGGER.trace("ActorID _repairArmor | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const location = $(event.currentTarget).attr("data-location");
    switch (location) {
      case "head": {
        const newAblation = Math.min((item.getData().headLocation.ablation + 1), item.getData().headLocation.sp);
        this._updateOwnedItemProp(item, "data.headLocation.ablation", newAblation);
        break;
      }
      case "body": {
        const newAblation = Math.min((item.getData().bodyLocation.ablation + 1), item.getData().bodyLocation.sp);
        this._updateOwnedItemProp(item, "data.bodyLocation.ablation", newAblation);
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

  async _installCyberwareAction(event) {
    LOGGER.trace("ActorID _installCyberware | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const foundationalId = $(event.currentTarget).parents(".item").attr("data-foundational-id");
    if (item.getData().isInstalled) {
      this._removeCyberware(item, foundationalId);
    } else {
      this._addCyberware(item);
    }
  }

  // TODO - REFACTOR
  async _addCyberware(item) {
    const compatibaleFoundationalCyberware = this.actor.getInstalledFoundationalCyberware(item.getData().type);
    if (compatibaleFoundationalCyberware.length < 1 && !item.getData().isFoundational) {
      Rules.lawyer(false, "CPR.warnnofoundationalcyberwareofcorrecttype");
    } else if (item.getData().isFoundational) {
      const formData = await InstallCyberwarePrompt.RenderPrompt({ item: item.data });
      this._addFoundationalCyberware(item, formData);
    } else {
      const formData = await InstallCyberwarePrompt.RenderPrompt({ item: item.data, foundationalCyberware: compatibaleFoundationalCyberware });
      this._addOptionalCyberware(item, formData);
    }
  }

  _addOptionalCyberware(item, formData) {
    LOGGER.trace("ActorID _addOptionalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = true;
    this.actor.loseHumanityValue(formData);
    LOGGER.trace(`ActorID _addOptionalCyberware | CPRActorSheet | applying optional cyberware to item ${formData.foundationalId}.`);
    const foundationalCyberware = this._getOwnedItem(formData.foundationalId);
    foundationalCyberware.getData().optionalIds.push(item.data._id);
    const usedSlots = foundationalCyberware.getData().optionalIds.length;
    const allowedSlots = Number(foundationalCyberware.getData().optionSlots);
    Rules.lawyer((usedSlots <= allowedSlots), "CPR.toomanyoptionalcyberwareinstalled");
    this._updateOwnedItem(item);
    this._updateOwnedItem(foundationalCyberware);
  }

  _addFoundationalCyberware(item, formData) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = true;
    this.actor.loseHumanityValue(formData);

    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Applying foundational cyberware.");
    this._updateOwnedItem(item);
  }

  async _removeCyberware(item, foundationalId) {
    LOGGER.trace("ActorID _removeCyberware | CPRActorSheet | Called.");
    const dialogTitle = SystemUtils.Localize("CPR.removecyberwaredialogtitle");
    const dialogMessage = `${SystemUtils.Localize("CPR.removecyberwaredialogtext")} ${item.name}?`;
    const confirmRemove = await ConfirmPrompt.RenderPrompt(dialogTitle, dialogMessage);
    if (confirmRemove) {
      if (item.getData().isFoundational) {
        this._removeFoundationalCyberware(item);
      } else {
        this._removeOptionalCyberware(item, foundationalId);
      }
    }
    this._updateOwnedItem(item);
  }

  _removeOptionalCyberware(item, foundationalId) {
    LOGGER.trace("ActorID _removeOptionalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = false;
    const foundationalCyberware = this._getOwnedItem(foundationalId);
    foundationalCyberware.getData().optionalIds.splice(foundationalCyberware.getData().optionalIds.indexOf(item.data._id));
    this._updateOwnedItem(item);
    this._updateOwnedItem(foundationalCyberware);
  }

  _removeFoundationalCyberware(item) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = false;
    if (item.getData().optionalIds) {
      item.getData().optionalIds.forEach((optionalId) => {
        let optional = this._getOwnedItem(optionalId);
        optional.getData().isInstalled = false;
        this._updateOwnedItem(optional);
      });
    }
    item.getData().optionalIds = [];
    this._updateOwnedItem(item);
  }

  _getInstalledCyberware() {
    LOGGER.trace("ActorID _getInstalledCyberware | CPRActorSheet | Called.");
    // Get all Installed Cyberware first...

    const allInstalledFoundationalCyberware = this.actor.data.filteredItems.cyberware.filter((cyberware) => cyberware.getData().isFoundational && cyberware.getData().isInstalled);

    // Now sort allInstalledCybere by type, and only get foundational
    let installedCyberware = {};
    for (const [type] of Object.entries(CPR.cyberwareTypeList)) {
      installedCyberware[type] = allInstalledFoundationalCyberware.filter((cyberware) => cyberware.getData().type === type);
      installedCyberware[type] = installedCyberware[type].map(
        (cyberware) => ({ foundation: cyberware, optionals: [] }),
      );
      installedCyberware[type].forEach((entry) => {
        entry.foundation.getData().optionalIds.forEach((id) => entry.optionals.push(this._getOwnedItem(id)));
      });
    }
    return installedCyberware;
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
        // TODO
        case "ablate-armor": {
          item.ablateArmor();
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

  // TODO - Revist hands restrictions, possibly remove.
  // TODO - Move to cpr-actor
  _getHands() {
    LOGGER.trace("ActorID _getHands | CPRActorSheet | Called.");
    return 2;
  }

  // TODO - Revist hands restrictions, possibly remove.
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

  // OWNED ITEM HELPER FUNCTIONS
  // TODO - Assert all usage correct.
  _updateOwnedItemProp(item, prop, value) {
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
    setProperty(item.data, prop, value);
    this._updateOwnedItem(item);
  }

  _updateOwnedItem(item) {
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
    this.actor.updateEmbeddedEntity("OwnedItem", item.data);
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
    // TODO - Need to get setting from const game system setting
    const setting = true;
    // If setting is true, prompt before delete, else delete.
    if (setting) {
      const promptMessage = `${SystemUtils.Localize("CPR.deleteconfirmation")} ${item.data.name}?`;
      const confirmDelete = await ConfirmPrompt.RenderPrompt(SystemUtils.Localize("CPR.deletedialogtitle"), promptMessage);
      if (confirmDelete) {
        this.actor.deleteEmbeddedEntity("OwnedItem", item._id);
      }
    } else {
      this.actor.deleteEmbeddedEntity("OwnedItem", item._id);
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
    this.actor.setRoles(formData);
  }
}
