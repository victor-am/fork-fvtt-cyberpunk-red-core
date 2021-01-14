import LOGGER from "../../utils/cpr-logger.js";
import CPRSystemUtils from "../../utils/cpr-systemUtils.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import { CPR } from "../../system/config.js";
import CPRBaseRollRequest from "../../rolls/cpr-baseroll-request.js";
import CPRDmgRollRequest from "../../rolls/cpr-dmgroll-request.js";
import { VerifyRollPrompt } from "../../dialog/cpr-verify-roll-prompt.js";
import { CPRChat } from "../../chat/cpr-chat.js";

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
      height: 600,
    });
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    // TODO - Understand how to use getData and when.
    LOGGER.trace("ActorID getData | CPRActorSheet | Called.");
    const data = super.getData();
    data.data.currentWoundState = this.actor.getWoundState(this.actor.data);
    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    // Make a roll
    html.find(".rollable").click((event) => this._onRoll(event));

    // Update equipment
    html.find(".equip").click(event => this._updateEquip(event));

    // Generic item action
    html.find(".item-action").click(event => this._itemAction(event));

    // Update Item
    html.find(".item-edit").click((event) => this._updateItem(event));

    // Delete item
    html.find(".item-delete").click((event) => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html.find(`.skill-level-input`).click(event => event.target.select()).change(event => this._updateSkill(event));

    // Show edit and delete buttons
    html.find(".row.item").hover(
      (event) => {
        // show edit and delete buttons
        $(event.currentTarget).contents().contents().addClass("show");
      },
      (event) => {
        // hide edit and delete buttons
        $(event.currentTarget).contents().contents().removeClass("show");
      }
    );
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace(`ActorID _onRoll | CPRActorSheet | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?
    let rollRequest;
    // Short circuit function to use damagerollrequest instead
    if ($(event.currentTarget).attr("data-roll-type") === "damage") {
      rollRequest = new CPRDmgRollRequest();
    } else {
      rollRequest = new CPRBaseRollRequest();
    }

    // TODO-- Where do these go?
    rollRequest.rollType = $(event.currentTarget).attr("data-roll-type");
    rollRequest.rollTitle = $(event.currentTarget).attr("data-roll-title");

    // Moving cases to their own functions, per request from Jay
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
        // check whether the weapon is equipped before allowing an attack
        const weap = this._getOwnedItem(itemId);
        if (weap.data.data.equippable.equipped === "equipped") {
          this._prepareRollAttack(rollRequest, itemId);
        } else {
          CPRSystemUtils.DisplayMessage("warn", "CPR.warningweaponnotequipped");
          return;
        }
        break;
      }
      case "damage": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        this._prepareRollDamage(rollRequest, itemId);
        break;
      }
    }

    // TODO needs separate ATTACK and DAMAGE prompts
    if (!event.ctrlKey) {
      rollRequest = await VerifyRollPrompt(rollRequest);
      LOGGER.debug(
        `ActorID _onRoll | CPRActorSheet | Checking rollRequest post VerifyRollPrompt.`
      );
    }

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


    if (rollRequest.rollType === "damage") {
      CPRChat.RenderRollCard(CPRRolls.DamageRoll(rollRequest));
    } else {
      // outputs to chat 
      CPRChat.RenderRollCard(CPRRolls.BaseRoll(rollRequest));
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

    switch (curr_equip) {
      case "owned": {
        // set next to carried
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        // check there are free hands for weapons
        if (item.data.type == "weapon") {
          if (!this._canHoldWeapon(item)) {
            // ui.n.error and notify work too
            CPRSystemUtils.DisplayMessage("warn", "CPR.warningtoomanyhands");
          }
        }
        this._updateOwnedItemProp(item, prop, "equipped");
        // for armor, update SP and armor penalty
        break;
      }
      case "equipped": {
        // set next to owned
        this._updateOwnedItemProp(item, prop, "owned");
        break;
      }
    }
  }

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
    const item = this._getOwnedItem(itemId);

    let prop = this._getObjProp(event); // return prop or undef
    let value = Math.clamped(-99, parseInt(event.target.value), 99);

    this._updateOwnedItemProp(item, prop, value)
  }

  // OWNED ITEM HELPER FUNCTIONS
  _updateOwnedItemProp(item, prop, value) {
    /**
     * Update an item property with a value
     */
    LOGGER.trace(`ActorID _updateOwnedItemProp | Item:${item}.`);
    setProperty(item.data, prop, value);
    this.actor.updateEmbeddedEntity("OwnedItem", item.data)
  }

  _updateItem(event) {
    /**
     * Pop up a form for an item to update its data
     */
    LOGGER.trace(`ActorID _itemUpdate | CPRActorSheet | Called.`);

    let itemId = this._getItemId(event);
    LOGGER.debug(`ActorID _itemUpdate | Item ID:${itemId}.`);
    const item = this.actor.items.find(i => i.data._id == itemId)
    item.sheet.render(true);
  }


  _getItemId(event) {
    LOGGER.trace(`ActorID _getItemId | CPRActorSheet | Called.`);
    return $(event.currentTarget).parents(`.item`).attr(`data-item-id`);
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find((i) => i.data._id == itemId);
  }

  _getObjProp(event) {
    return $(event.currentTarget).attr(`data-item-prop`);
  }

  _deleteOwnedItem(event) {
    LOGGER.trace(`ActorID _deleteOwnedItem | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    let itemList = this.actor.items;
    itemList.forEach((item) => {
      if (item.data._id === itemId) item.delete();
    });
  }

  // TODO - Revist, do we need template data? Is function used.
  _addSkill() {
    LOGGER.trace(`ActorID _addSkill | CPRActorSheet | called.`);
    let itemData = {
      name: "skill",
      type: "skill",
      data: {},
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true });
  }

  // TODO - Fix
  _getArmorPenaltyMods(stat) {
    let penaltyStats = ['ref', 'dex', 'move'];
    let penaltyMods = [0];
    if (penaltyStats.includes(stat)) {
      for (let location of ["head", "body"]) {
        let penaltyValue = Number(this._getArmorValue("penalty", location));
        if (penaltyValue > 0) {
          penaltyMods.push((0 - penaltyValue));
        }
      }
    }
    penaltyMods = [(Math.min(...penaltyMods))];
    if (penaltyMods == 0) {
      penaltyMods = "";
    }
    return penaltyMods;
  }

  // PREPARE ROLLS
  _prepareRollStat(rollRequest) {
    rollRequest.statValue = this.getData().data.stats[rollRequest.rollTitle].value;
    rollRequest.mods.push(this._getArmorPenaltyMods(rollRequest.rollTitle));
    LOGGER.trace(`ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
  }

  _prepareRollSkill(rollRequest, itemId) {
    LOGGER.trace(
      `ActorID _prepareRollSkill | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`
    );
    const item = this._getOwnedItem(itemId);

    rollRequest.statValue = this.getData().data.stats[item.data.data.stat].value;
    rollRequest.skillValue = item.data.data.level;

    rollRequest.mods.push(this._getArmorPenaltyMods(item.data.data.stat));
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
    }
    LOGGER.trace(`Actor _prepareRollAttack | rolling attack | skillName: ${weaponSkill} skillValue: ${rollRequest.skillValue} statValue: ${rollRequest.statValue}`);
  }

  _prepareRollDamage(rollRequest, itemId) {
    // setup data
    const weaponItem = this._getOwnedItem(itemId);
    rollRequest.rollTitle = weaponItem.data.name;
    const attackSkill = weaponItem.data.data.weaponSkill;
    const weaponType = weaponItem.data.data.weaponType;

    // adjust roleRequest object
    rollRequest.formula = weaponItem.data.data.damage;
    rollRequest.attackSkill = attackSkill;
    rollRequest.weaponType = weaponType;
  }
}