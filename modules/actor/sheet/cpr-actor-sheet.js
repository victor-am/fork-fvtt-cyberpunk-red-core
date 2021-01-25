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
    });
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    // TODO - Understand how to use getData and when.
    // INFO - Only add new data points to getData when you need a complex struct.
    // DO NOT add new data points into getData to shorten dataPaths
    LOGGER.trace("ActorID getData | CPRActorSheet | Called.");
    const data = super.getData();
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

    // Install Cyberware
    html.find(".install").click((event) => this._installCyberwareAction(event));

    // Uninstall Cyberware
    html.find(".uninstall").click((event) => this._uninstallCyberwareAction(event));

    // Generic item action
    html.find(".item-action").click((event) => this._itemAction(event));

    // Render Item Card
    html.find(".item-edit").click((event) => this._renderItemCard(event));

    // Delete item
    html.find(".item-delete").click((event) => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html.find(".skill-level-input").click((event) => event.target.select()).change((event) => this._updateSkill(event));

    html.find(".expand-button").click((event) => {
      const block = $(event.currentTarget.parentElement);
      if (block.hasClass("expand")) {
        block.removeClass("expand");
      } else {
        block.addClass("expand");
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
<<<<<<< HEAD
        // check whether the weapon is equipped before allowing an attack
        const weap = this._getOwnedItem(itemId);
        if (weap.data.data.equippable.equipped === "equipped") {
          this._prepareRollAttack(rollRequest, itemId);
        } else {
          ui.notifications.warn("This weapon is not equipped!");
          return;
        }
=======
        this._prepareRollAttack(rollRequest, itemId);
>>>>>>> dev
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

<<<<<<< HEAD
    if (rollRequest.rollType == "abort") {
      return;
    }

    if (rollRequest.rollType === "attack") {
      const weaponId = $(event.currentTarget).attr("data-item-id");
      let weaponItem = this.actor.items.find((i) => i.data._id == weaponId);
      if (weaponItem.data.data.isRanged) {
        // Need to figure out how to determine which we are doing here, single, autofire and suppressive
        // Defaulting to Single
        weaponItem.fireRangedWeapon("single");
      }
    }


=======
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
>>>>>>> dev
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
        rollRequest.rollTitle = game.i18n.localize(CPR.roleAbilityList[roleAbility]);
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
<<<<<<< HEAD
      // outputs to chat 
      RollCard(CPRRolls.BaseRoll(rollRequest));
    }

  }

  async _updateEquip(event) {
    /**
     * Equip or Unequip an item. Make stat changes and check
     * conditions (like free hands) as necessary.
     */
    LOGGER.trace(`ActorID _updateEquip | CPRActorSheet | Called.`);
    const item_id = $(event.currentTarget).attr("data-item-id");
    const item = this._getOwnedItem(item_id);
    const curr_equip = $(event.currentTarget).attr("data-curr-equip");
    let prop = this._getObjProp(event); // panic if undefined
=======
      rollRequest.stat = "dex";
      rollRequest.statValue = this.getData().data.stats.dex.value;
    }

    // DIVEST!
    // TEMP: For now we will get the mods like so, but ideally we would have a
    // single function that would compile mods from all sources.
    if (weaponItem.getData().quality === "excellent") {
      rollRequest.mods.push(1);
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
>>>>>>> dev

  _cycleEquipState(event) {
    LOGGER.trace("ActorID _cycleEquipState | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const prop = this._getObjProp(event);
    switch (item.data.data.equippable.equipped) {
      case "owned": {
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
<<<<<<< HEAD
        // check there are free hands for weapons
        if (item.data.type == "weapon") {
          if (!this._canHoldWeapon(item)) {
            // ui.n.error and notify work too
            ui.notifications.warn("You are using more hands than you have!");
          }
=======
        if (item.data.type === "weapon") {
          Rules.lawyer(this._canHoldWeapon(item), "CPR.warningtoomanyhands");
>>>>>>> dev
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

<<<<<<< HEAD
  async _itemAction(event) {
    LOGGER.trace(`ActorID _itemAction | CPRActorSheet | Called.`);
    const itemId = $(event.currentTarget).attr("data-item-id");
    const item = this._getOwnedItem(itemId);
    if (item) {
      item.doAction(this.actor, (event.currentTarget).attributes);
      this.actor.updateEmbeddedEntity("OwnedItem", item.data);
    }
  }

  _getEquippedArmors(loc) {
    /**
     * game.actors.entities[].sheet.getEquippedArmors
     * Get equipped armors at the given loc (location; "body" or "head")
     * Returns an array of Item objects with type "armor"
     */
    LOGGER.trace(`ActorID _getEquippedArmors | CPRActorSheet | Called.`);

    // Console trick to get at this data:
    // game.actors.entities[0].items.filter((a) => a.data.type == "armor" && 
    //      a.data.data.equippable.equipped == "equipped" &&
    //      a.data.data.isHeadLocation)
    const armors = this.actor.items.filter((a) => a.data.type == "armor");
    const eq_armors = armors.filter((a) => a.data.data.equippable.equipped == "equipped");

    if (loc == "body") {
      return eq_armors.filter((a) => a.data.data.isBodyLocation);
    } else if (loc == "head") {
      return eq_armors.filter((a) => a.data.data.isHeadLocation);
    } else {
      throw new Error(`Bad location given: ${loc}`);
    }
  }

  _getArmorValue(valueType, location) {
    /**
     * game.actors.entities[].sheet.getArmorValue
     * Given a list of armor items, find the highest valueType (sp or penalty) of them.
     * Return a 0 if nothing is equipped.
     */
    LOGGER.trace(`ActorID _getArmorValue| CPRActorSheet | Called.`);

    const armors = this._getEquippedArmors(location);
    let sps;
    let penalties;

    if (location === "body") {
      sps = armors.map(a => a.data.data.bodyLocation.sp);
    } else if (location === "head") {
      sps = armors.map(a => a.data.data.headLocation.sp);
    } // we assume getEquippedArmors will throw an error with a bad loc
    penalties = armors.map(a => a.data.data.penalty);

    penalties.push(0);
    sps.push(0);                // force a 0 if nothing is equipped

    if (valueType === "sp") {
      return Math.max(...sps);    // Math.max treats null values in array as 0  
    }
    if (valueType === "penalty") {
      return Math.max(...penalties);    // Math.max treats null values in array as 0  
    }
    return 0;
  }


  // Leaving this in for backwards compat, but let's move to _getArmorValue()
  _getMaxSP(loc) {
    /**
     * game.actors.entities[].sheet.getMaxSP
     * Given a list of armor items, find the highest SP of them.
     * Return a 0 if nothing is equipped.
     */
    LOGGER.trace(`ActorID _getMaxSP | CPRActorSheet | Called.`);

    const armors = this._getEquippedArmors(loc);
    let sps;

    if (loc == "body") {
      sps = armors.map(a => a.data.data.bodyLocation.sp);
    } else if (loc == "head") {
      sps = armors.map(a => a.data.data.headLocation.sp);
    } // we assume getEquippedArmors will throw an error with a bad loc

    sps.push(0);                // force a 0 if nothing is equipped
    return Math.max(...sps);    // Math.max treats null values in array as 0
  }

  _getHands() {
    /**
     * game.actors.entities[].sheet._getHands
     * Return the number of hands an actor has. For now, this is always 2,
     * but in the future it should consider borgware upgrades.
     */
    LOGGER.trace(`ActorID _getHands | CPRActorSheet | Called.`);
    return 2;
  }

  _getEquippedWeapons() {
    /**
     * game.actors.entities[].sheet._getEquippedWeapons
     * Return a list of equipped weapons on this actor.
     */
    LOGGER.trace(`ActorID _getEquippedWeapons | CPRActorSheet | Called.`);
    const weapons = this.actor.items.filter((a) => a.data.type == "weapon");
    return weapons.filter((a) => a.data.data.equippable.equipped == "equipped");
  }

  _getFreeHands() {
    /**
     * game.actors.entities[].sheet._getFreeHands
     * Return the number of free hands this actor has
     */
    LOGGER.trace(`ActorID _getFreeHands | CPRActorSheet | Called.`);
    const weapons = this._getEquippedWeapons();
    const needed = weapons.map(w => w.data.data.handsReq);

    // add up the # of used hands. If nothing is equipped, default to the
    // number of hands the actor has.
    const free_hands = this._getHands() - needed.reduce((a, b) => a + b, 0);
    return free_hands
  }

  _canHoldWeapon(weapon) {
    /**
     * game.actors.entities[].sheet._canHoldWeapon
     * Check if the actor can hold (equip) the given weapon. Return true if
     * the actor has enough free hands, false if not.
     */
    LOGGER.trace(`ActorID _canHoldWeapon | CPRActorSheet | Called.`);
    const needed = weapon.data.data.handsReq;
    if (needed > this._getFreeHands()) {
      return false;
    }
    return true;
  }

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.

  _updateSkill(event) {
    LOGGER.trace(`ActorID _updateSkill | CPRActorSheet | Called.`);

    let itemId = this._getItemId(event);
=======
  _addOptionalCyberware(item, formData) {
    LOGGER.trace("ActorID _addOptionalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = true;
    LOGGER.trace(
      `ActorID _addOptionalCyberware | CPRActorSheet | applying optional cyberware to item ${formData.foundationalId}.`,
    );
    const foundationalCyberware = this._getOwnedItem(formData.foundationalId);
    foundationalCyberware.getData().optionalIds.push(item.data._id);
    this._updateOwnedItem(item);
    this._updateOwnedItem(foundationalCyberware);
  }

  _addFoundationalCyberware(item, formData) {
    LOGGER.trace("ActorID _addFoundationalCyberware | CPRActorSheet | Called.");
    item.getData().isInstalled = true;
    LOGGER.trace(
      "ActorID _addFoundationalCyberware | CPRActorSheet | Applying foundational cyberware.",
    );
    this._updateOwnedItem(item);
  }

  _removeCyberware(item, formData) { }

  async _installCyberwareAction(event) {
    LOGGER.trace("ActorID _installCyberware | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
    const installedFoundationalCyberware = this.actor.getInstalledFoundationalCyberware(item.getData().type);
    const formData = await InstallCyberwarePrompt({ item: item.data, cyberware: installedFoundationalCyberware });
    if (installedFoundationalCyberware.length > 1 && !item.getData().isFoundational) {
      this._addOptionalCyberware(item, formData);
    } else if (item.getData().isFoundational) {
      this._addFoundationalCyberware(item, formData);
    } else {
      Rules.lawyer(false, "CPR.warnnofoundationalcyberwareofcorrecttype");
    }
    // id of the selected foundational && HL type selection
  }

  _uninstallCyberware(event) {
    LOGGER.trace("ActorID _uninstallCyberware | CPRActorSheet | Called.");
    const item = this._getOwnedItem(this._getItemId(event));
  }

  _getInstalledCyberware() {
    LOGGER.trace("ActorID _getInstalledCyberware | CPRActorSheet | Called.");
    const allCyberware = this.actor.data.filteredItems.cyberware;
    let installedFoundationalCyberware = allCyberware.filter((cyberware) => cyberware.getData().isInstalled && cyberware.getData().isFoundational);

    installedFoundationalCyberware = installedFoundationalCyberware.map(
      (cyberware) => ({ foundation: cyberware, optionals: [] }),
    );
    installedFoundationalCyberware.forEach((entry) => {
      entry.foundation.getData().optionalIds.forEach((id) => entry.optionals.push(this._getOwnedItem(id)));
    });
    return installedFoundationalCyberware;
  }

  _itemAction(event) {
    LOGGER.trace("ActorID _itemAction | CPRActorSheet | Called.");
    const itemId = $(event.currentTarget).attr("data-item-id");
>>>>>>> dev
    const item = this._getOwnedItem(itemId);
    if (item) {
      item.doAction(this.actor, event.currentTarget.attributes);
      this.actor.updateEmbeddedEntity("OwnedItem", item.data);
    }
  }

  // TODO - Move to cpr-actor
  _getEquippedArmors(location) {
    LOGGER.trace("ActorID _getEquippedArmors | CPRActorSheet | Called.");
    // TODO - Helper function on ACTOR to get equipedArmors
    const armors = this.actor.items.filter((item) => item.data.type === "armor");
    const equipped = armors.filter((item) => item.data.data.equippable.equipped === "equipped");

    if (location === "body") {
      return equipped.filter((item) => item.data.data.isBodyLocation);
    }
    if (location === "head") {
      return equipped.filter((item) => item.data.data.isHeadLocation);
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
    return weapons.filter((a) => a.data.data.equippable.equipped === "equipped");
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
<<<<<<< HEAD
    /**
     * Update an item property with a value
     */
    LOGGER.trace(`ActorID _updateOwnedItemProp | Item:${item}.`);
=======
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
>>>>>>> dev
    setProperty(item.data, prop, value);
    this._updateOwnedItem(item);
  }

  _updateOwnedItem(item) {
    LOGGER.trace("ActorID _updateOwnedItemProp | Called.");
    this.actor.updateEmbeddedEntity("OwnedItem", item.data);
  }

<<<<<<< HEAD
    let itemId = this._getItemId(event);
    LOGGER.debug(`ActorID _itemUpdate | Item ID:${itemId}.`);
    const item = this.actor.items.find(i => i.data._id == itemId)
=======
  _renderItemCard(event) {
    LOGGER.trace("ActorID _itemUpdate | CPRActorSheet | Called.");
    const itemId = this._getItemId(event);
    const item = this.actor.items.find((i) => i.data._id === itemId);
>>>>>>> dev
    item.sheet.render(true);
  }

  _getItemId(event) {
    LOGGER.trace("ActorID _getItemId | CPRActorSheet | Called.");
    return $(event.currentTarget).parents(".item").attr("data-item-id");
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id === itemId);
  }

  _getObjProp(event) {
    return $(event.currentTarget).attr("data-item-prop");
  }

  async _deleteOwnedItem(event) {
    LOGGER.trace("ActorID _deleteOwnedItem | CPRActorSheet | Called.");
    const itemId = this._getItemId(event);
    const item = this._getOwnedItem(itemId);
    // TODO - Need to get setting from const game system setting
    const setting = true;
    // If setting is true, prompt before delete, else delete.
    if (setting) {
      const confirmDelete = await ConfirmPrompt.RenderPrompt();
      if (confirmDelete) {
        this.actor.deleteEmbeddedEntity("OwnedItem", itemId);
      }
    } else {
      this.actor.deleteEmbeddedEntity("OwnedItem", itemId);
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

<<<<<<< HEAD
  _prepareRollStat(rollRequest) {
    rollRequest.statValue = this.getData().data.stats[rollRequest.rollTitle].value;
    let penaltyStats = ['ref', 'dex', 'move'];
    if (penaltyStats.includes(rollRequest.rollTitle)) {
      for (let location of ["head", "body"]) {
        rollRequest.mods.push((0 - Number(this._getArmorValue("penalty", location))));
      }
    }
    LOGGER.trace(`ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
  }

  _prepareRollSkill(rollRequest, itemId) {
    LOGGER.trace(
      `ActorID _prepareRollSkill | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`
    );
    const item = this._getOwnedItem(itemId);
    rollRequest.statValue = this.getData().data.stats[
      item.data.data.stat
    ].value;
    rollRequest.skillValue = item.data.data.level;
  }

  _prepareRollAbility(rollRequest) {
    LOGGER.trace(
      `ActorID _prepareRollAbility | rolling ability: ` +
      rollRequest.rollTitle +
      ` | ` +
      rollRequest.skillValue
    );
    const actorData = this.getData().data;
    rollRequest.roleValue = actorData.roleInfo.roleskills[actorData.roleInfo["role"]][rollRequest.rollTitle];
    rollRequest.rollTitle = game.i18n.localize(CPR['roleAbilityList'][rollRequest.rollTitle]);
  }

  _prepareRollAttack(rollRequest, itemId) {
    const weaponItem = this._getOwnedItem(itemId);
    
    rollRequest.rollTitle = weaponItem.data.name;
    const isRanged = weaponItem.data.data.isRanged;
    const weaponSkill = weaponItem.data.data.weaponSkill;
    const skillId = this.actor.items.find((i) => i.name == weaponSkill);
    rollRequest.statValue = this.getData().data.stats["dex"].value;
    // if weapon is ranged, change stat to ref
    if (isRanged === "true") {
      rollRequest.statValue = this.getData().data.stats["ref"].value;
    }
    // if char owns relevant skill, get skill value
    if (skillId == null) {
      rollRequest.skillValue = 0;
    } else {
      rollRequest.skillValue = skillId.data.data.level;
=======
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
>>>>>>> dev
    }
    return Math.min(...penaltyMods);
  }
}
