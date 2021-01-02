import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";
import CPRRolls from "../../rolls/cpr-rolls.js";
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
    LOGGER.trace("AcotrID getData | CPRActorSheet | Called.");
    const data = super.getData();
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
    sheetData.inventoryCategories = CPR.inventoryCategories;
  }

  // TODO - Function is getting far to long, we need to find ways to condense it.
  async _onRoll(event) {
    LOGGER.trace(`ActorID _onRoll | CPRActorSheet | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?\
    let rollRequest = new CPRBaseRollRequest();    
    
    // TODO-- Where do these go?
    rollRequest.rollType = $(event.currentTarget).attr("data-roll-type");
    rollRequest.rollTitle = $(event.currentTarget).attr("data-roll-title");    
    
    if (!event.ctrlKey) {
      rollRequest.mods.push(...await VerifyRollPrompt());
    }
    
    // TODO-- better way to handle this..
    if (rollRequest.mods.includes("cancel")) {
      rollType = "cancel";
    }
    
    let actorData = this.getData().data;
    switch (rollRequest.rollType) {
      case "stat": {
        rollRequest.statValue = actorData.stats[rollRequest.rollTitle].value;
        LOGGER.trace(`ActorID _onRoll | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue}`);
        break;
      }
      case "skill": {
        const itemId = this._getItemId(event);
        const item = this._getOwnedItem(itemId); 
        rollRequest.statValue = actorData.stats[item.data.data.stat].value;
        rollRequest.skillValue = item.data.data.level;
        LOGGER.trace(`ActorID _onRoll | rolling ${rollRequest.rollTitle} | Stat Value: ${rollRequest.statValue} + Skill Value:${rollRequest.skillValue}`);
        console.log(this);
        break;
      }
      case "roleAbility": {
        const roleInfo = actorData.roleInfo;
        const role = roleInfo["role"];
        rollRequest.skillValue = roleInfo.roleskills[role][rollRequest.rollTitle];
        LOGGER.trace(`ActorID _onRoll | rolling ability: ` + rollRequest.rollTitle + ` | ` + rollRequest.skillValue);
        break;
      }
      case "weapon": {
        const weaponItem = this.actor.items.find(i => i.data._id == itemId);
        const weaponSkill = weaponItem.data.data.weaponSkill;
        const skillId = this.actor.items.find(i => i.name == weaponSkill )

        console.log("item");
        console.log(item);
        console.log(weaponSkill);
        break;
      }
      // Q: Do we ever need to cancel a roll? 
      // This really only applys if we display the mods dialog, and then they wish to NOT enter a mod.
      // If we want to have this really be a function of the system, we should ALWAYS display the dialog, as it's the only control available to trigger canceling a roll.
      case "attack": {
        // Get data from the charsheet
        const skillName = $(event.currentTarget).attr("data-attack-skill");
        let statName = 'dex';
        const isRanged = $(event.currentTarget).attr("data-is-ranged");
        // if weapon is ranged, change stat to ref
        if (isRanged === 'true') statName = 'ref'
        // if char owns relevant skill, get skill value
        try {
          rollRequest.skillValue = this.actor.data.filteredItems.skill.find(
            (i) => i.data.name === skillName
          ).data.data.level;
        // set skill value to 0 if not
        } catch (err) {
          rollRequest.skillValue = 0;
        }
        // get stat value
        rollRequest.statValue = this.actor.data.data.stats[statName].value;
        LOGGER.trace(
          `Actor _onRoll | rolling ${$(event.currentTarget).attr("data-weapon-name")} attack | skillName: ${skillName} skillValue: ${rollRequest.skillValue} statName: ${statName} statValue: ${rollRequest.statValue}`
        );
        break;
      }
      case "cancel": {
        // Catch all if we want a way to cancel out of a roll.
        return;
      }
    }

    RollCard(CPRRolls.BaseRoll(rollRequest));
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