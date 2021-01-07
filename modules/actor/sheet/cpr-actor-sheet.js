import LOGGER from "../../utils/cpr-logger.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import { CPR } from "../../system/config.js";
import CPRBaseRollRequest from "../../rolls/cpr-baseroll-request.js";
import CPRDmgRollRequest from "../../rolls/cpr-dmgroll-request.js";
import { VerifyRollPrompt } from "../../dialog/cpr-verify-roll-prompt.js";
import { RollCard } from "../../chat/cpr-rollcard.js";

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

    // Update Item
    html.find(".item-edit").click((event) => this._updateItem(event));

    // Delete item
    html.find(".item-delete").click((event) => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find(".add-skill").click((event) => this._addSkill(event));

    html
      .find(`.skill-level-input`)
      .click((event) => event.target.select())
      .change((event) => this._updateItemProp(event));

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
      case "weapon":
      case "attack": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        console.log(itemId);
        this._prepareRollAttack(rollRequest, itemId);
        break;
      }
      case "damage": {
        const itemId = $(event.currentTarget).attr("data-item-id");
        this._prepareRollDamage(rollRequest, itemId);
        break;
      }
    }

    // TODO needs separate ATTACK and DAMAGE prompts
    if (!event.ctrlKey && rollRequest.rollType !== "damage") {
      rollRequest = await VerifyRollPrompt(rollRequest);
      LOGGER.debug(
        `ActorID _onRoll | CPRActorSheet | Checking rollRequest post VerifyRollPrompt.`
      );
    }

    if (rollRequest.rollType == "abort") {
      return;
    }
    if (rollRequest.rollType === "damage") {
      RollCard(CPRRolls.DamageRoll(rollRequest));
    } else {
      RollCard(CPRRolls.BaseRoll(rollRequest));
    }
  }

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.

  _updateItem(event) {
    LOGGER.trace(`ActorID _itemUpdate | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    LOGGER.debug(`ActorID _itemUpdate | Item ID:${itemId}.`);
    const item = this.actor.items.find((i) => i.data._id == itemId);
    item.sheet.render(true);
  }

  _updateItemProp(event) {
    LOGGER.trace(`ActorID _updateItemProp | CPRActorSheet | Called.`);

    let itemId = this._getItemId(event);
    const item = this._getOwnedItem(itemId);

    let prop = this._getObjProp(event); // return prop or undef
    let value = Math.clamped(-99, parseInt(event.target.value), 99);

    LOGGER.debug(`ActorID _itemUpdate | Item ID:${itemId}.`);
    setProperty(item.data, prop, value);

    this.actor.updateEmbeddedEntity("OwnedItem", item.data);
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

  _addSkill() {
    LOGGER.trace(`ActorID _addSkill | CPRActorSheet | called.`);
    let itemData = {
      name: "skill",
      type: "skill",
      data: {},
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true });
  }

  _prepareRollStat(rollRequest) {
    rollRequest.statValue = this.getData().data.stats[
      rollRequest.rollTitle
    ].value;
    LOGGER.trace(
      `ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`
    );
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

    rollRequest.skillValue =
      actorData.roleInfo.roleskills[actorData.roleInfo["role"]][
        rollRequest.rollTitle
      ];
    rollRequest.rollTitle = game.i18n.localize(
      CPR["roleAbilityList"][rollRequest.rollTitle]
    );
  }

  _prepareRollAttack(rollRequest, itemId) {
    const weaponItem = this._getOwnedItem(itemId);
    console.log(itemId);
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
    LOGGER.trace(
      `Actor _prepareRollAttack | rolling attack | skillName: ${weaponSkill} skillValue: ${rollRequest.skillValue} statValue: ${rollRequest.statValue}`
    );
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
