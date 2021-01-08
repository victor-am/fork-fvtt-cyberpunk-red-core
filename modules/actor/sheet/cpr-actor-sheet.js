import LOGGER from "../../utils/cpr-logger.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import { CPR } from "../../system/config.js"
import CPRBaseRollRequest from "../../rolls/cpr-baseroll-request.js";
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
    html.find(".rollable").click(event => this._onRoll(event));

    // Update equipment
    html.find(".equip").click(event => this._updateEquip(event));

    // Update Item
    html.find('.item-edit').click(event => this._updateItem(event));

    // Delete item
    html.find('.item-delete').click(event => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find('.add-skill').click(event => this._addSkill(event));

    html.find(`.skill-level-input`).click(event => event.target.select()).change(event => this._updateSkill(event));

    // Show edit and delete buttons
    html.find(".row.item").hover(event => {
      // show edit and delete buttons
      $(event.currentTarget).contents().contents().addClass('show')
    }, event => {
      // hide edit and delete buttons
      $(event.currentTarget).contents().contents().removeClass('show')
    });
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace(`ActorID _onRoll | CPRActorSheet | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?
    let rollRequest = new CPRBaseRollRequest();    
    
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
        const itemId = this._getItemId(event);
        const weaponItem = this.actor.items.find(i => i.data._id == itemId);
        this._prepareRollAttack(rollRequest, weaponItem);
        break;
      }
    }
    
    if (!event.ctrlKey) {
      rollRequest = await VerifyRollPrompt(rollRequest);
      LOGGER.debug(`ActorID _onRoll | CPRActorSheet | Checking rollRequest post VerifyRollPrompt.`);
    }

    if (rollRequest.rollType == "abort") {
      return;
    }

    RollCard(CPRRolls.BaseRoll(rollRequest));
  }

  async _updateEquip(event) {
    /**
     * Equip or Unequip an item. Make stat changes and check
     * conditions (like free hands) as necessary.
     */
    LOGGER.trace(`ActorID _equip | CPRActorSheet | Called.`);
    const item_id = $(event.currentTarget).attr("data-item-id");
    const item = this._getOwnedItem(item_id);
    const curr_equip = $(event.currentTarget).attr("curr-equip");
    let prop = this._getObjProp(event); // panic if undefined

    switch (curr_equip) {
      case "owned": {
        // set next to carried
        this._updateOwnedItemProp(item, prop, "carried");
        break;
      }
      case "carried": {
        // check there are free hands for weapons
        // set next to equipped if so, otherwise error out
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

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.

  _updateSkill(event) {
    LOGGER.trace(`ActorID _updateSkill | CPRActorSheet | Called.`);
    
    let itemId = this._getItemId(event);
    const item = this._getOwnedItem(itemId);

    let prop = this._getObjProp(event); // return prop or undef
    let value = Math.clamped(-99, parseInt(event.target.value), 99);

    this._updateOwnedItemProp(item, prop, value)
  }

  _updateOwnedItemProp(item, prop, value) {
    /**
     * Update an item property with a value
     */
    LOGGER.debug(`ActorID _updateOwnedItemProp | Item:${item}.`);
    LOGGER.debug(`Updating ${prop} to ${value}`)
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
    return this.actor.items.find(i => i.data._id == itemId);
  }

  _getObjProp(event) {
    return $(event.currentTarget).attr(`data-item-prop`);
  }

  _deleteOwnedItem(event) {
    LOGGER.trace(`ActorID _deleteOwnedItem | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    let itemList = this.actor.items;
    itemList.forEach(item => { if (item.data._id === itemId) item.delete() });
  }

  _addSkill() {
    LOGGER.trace(`ActorID _addSkill | CPRActorSheet | called.`);
    let itemData = {
      name: "skill", type: 'skill', data: {}
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true })
  }

  _prepareRollStat(rollRequest) {
    rollRequest.statValue = this.getData().data.stats[rollRequest.rollTitle].value;
    LOGGER.trace(`ActorID _prepareRollStat | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
  }

  _prepareRollSkill(rollRequest, itemId) {
    LOGGER.trace(`ActorID _prepareRollSkill | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`);
    const item = this._getOwnedItem(itemId); 
    rollRequest.statValue = this.getData().data.stats[item.data.data.stat].value;
    rollRequest.skillValue = item.data.data.level;
  }

  _prepareRollAbility(rollRequest) {
    LOGGER.trace(`ActorID _prepareRollAbility | rolling ability: ` + rollRequest.rollTitle + ` | ` + rollRequest.skillValue);
    const actorData = this.getData().data;
    
    rollRequest.skillValue = actorData.roleInfo.roleskills[actorData.roleInfo["role"]][rollRequest.rollTitle];
    rollRequest.rollTitle=game.i18n.localize(CPR['roleAbilityList'][rollRequest.rollTitle]);
  }

  _prepareRollAttack(rollRequest, weaponItem) {
    rollRequest.rollTitle = weaponItem.data.name;
    const isRanged = weaponItem.data.data.isRanged;
    const weaponSkill = weaponItem.data.data.weaponSkill;
    const skillId = this.actor.items.find(i => i.name == weaponSkill);
    rollRequest.statValue = this.getData().data.stats["dex"].value;
    // if weapon is ranged, change stat to ref
    if (isRanged === 'true') {
      rollRequest.statValue = this.getData().data.stats["ref"].value;
    }
    // if char owns relevant skill, get skill value
    if (skillId == null) {
      rollRequest.skillValue = 0;
    }
    else
    {
      rollRequest.skillValue = skillId.data.data.level;
    }
    LOGGER.trace(`Actor _prepareRollAttack | rolling attack | skillName: ${weaponSkill} skillValue: ${rollRequest.skillValue} statValue: ${rollRequest.statValue}`);
  }

}