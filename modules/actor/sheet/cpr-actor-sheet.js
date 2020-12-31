import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
import { RollModifierPromptDiag } from "../../dialog/cpr-rollmod-dialog.js";
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
    LOGGER.trace("AcotrID getData | CPRActorSheet | Called.");
    const data = super.getData();
    this._addConfigData(data);
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

    // Update Item
    html.find('.item-edit').click(event => this._updateItem(event));

    // Delete item
    html.find('.item-delete').click(event => this._deleteOwnedItem(event));

    // Add New Skill Item To Sheet
    html.find('.add-skill').click(event => this._addSkill(event));
  }

  /* -------------------------------------------- */
  //  INTERNAL METHODS BELOW HERE
  /* -------------------------------------------- */


  _addConfigData(sheetData) {
    // TODO - sheetData config additions should be added in a less procedural way.
    LOGGER.trace(`ActorID _addConfigData | CPRActorSheet | Called.`);
    sheetData.skillCategories = CPR.skillCategories;
    sheetData.statList = CPR.statList;
    sheetData.skillDifficulties = CPR.skillDifficulties;
    sheetData.skillList = CPR.skillList;
    sheetData.roleAbilityList = CPR.roleAbilityList;
    sheetData.roleList = CPR.roleList;
    sheetData.weaponTypeList = CPR.weaponTypeList;
    sheetData.ammoVariety = CPR.ammoVariety;
  }

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace(`ActorID _onRoll | CPRActorSheet | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?
    let totalMods = [0];
    let statValue = 0;
    let skillValue = 0;
    let rollCritical = true;
    
    let rollType = $(event.currentTarget).attr("data-roll-type");
    let rollTitle = $(event.currentTarget).attr("data-roll-title");

    // If we are rolling a stat this will be null... SHould only 
    

    // Do I need this?
    let actorData = this.getData();

    if (!event.ctrlKey) {
      totalMods.push(await RollModifierPromptDiag());
    }

    if (totalMods.includes("cancel")) {
      rollType = "cancel";
    }

    switch (rollType) {
      case "stat": {
        statValue = actorData.data.stats[rollTitle].value;
        LOGGER.trace(`ActorID _onRoll | rolling ${rollTitle} | Stat Value: ${statValue}`);
        break;
      }
      case "skill": {
        const itemId = this._getItemId(event);
        const item = this._getOwnedItem(itemId); 
        statValue = actorData.data.stats[item.data.data.stat].value;
        skillValue = item.data.data.level;
        LOGGER.trace(`ActorID _onRoll | rolling ${rollTitle} | Stat Value: ${statValue} + Skill Value:${skillValue}`);
        console.log(this);
        break;
      }
      case "roleAbility": {
        const roleInfo = actorData.data.roleInfo;
        const role = roleInfo["role"];
        skillValue = roleInfo.roleskills[role][rollTitle];
        LOGGER.trace(`ActorID _onRoll | rolling ability: ` + rollTitle + ` | ` + skillValue);
        break;
      }
      // Q: Do we ever need to cancel a roll? 
      // This really only applys if we display the mods dialog, and then they wish to NOT enter a mod.
      // If we want to have this really be a function of the system, we should ALWAYS display the dialog, as it's the only control available to trigger canceling a roll.
      case "cancel": {
        // Catch all if we want a way to cancel out of a roll.
        return;
      }
    }

    RollCard(CPRRolls.BaseRoll(statValue, skillValue, totalMods, rollCritical));
  }

  // TODO - We should go through the following, and assure all private methods can be used outside of the context of UI controls as well.

  _updateItem(event) {
    LOGGER.trace(`ActorID _itemUpdate | CPRActorSheet | Called.`);
    let itemId = this._getItemId(event);
    LOGGER.debug(`ActorID _itemUpdate | Item ID:${itemId}.`);    
    const item = this.actor.items.find(i => i.data._id == itemId)
    console.log(item);
    item.sheet.render(true);
  }

  _getItemId(event) {
    LOGGER.trace(`ActorID _getItemId | CPRActorSheet | Called.`);
    return $(event.currentTarget).attr("data-item-id")
  }

  _getOwnedItem(itemId) {
    return this.actor.items.find(i => i.data._id == itemId);
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
}