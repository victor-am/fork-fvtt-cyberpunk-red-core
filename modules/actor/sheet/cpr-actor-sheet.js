import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";
import { BaseRoll } from "../../system/dice.js";
import { RollModiferPromptDiag } from "../../dialog/cpr-rollmod-dialog.js";
import { RollCard } from "../../chat/cpr-rollcard.js";

/**
 * Extend the basic ActorSheet.
 * @extends {ActorSheet}
 */
export default class CPRActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    LOGGER.trace("Default Options | CPRActorSheet | Called.");
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
    LOGGER.trace("Get Data | CPRActorSheet | Called.");
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


  /*
    INTERNAL METHODS BELOW HERE
  */

  /* -------------------------------------------- */
  _addConfigData(sheetData) {
    // TODO - sheetData config additions should be added in a less procedural way.
    LOGGER.trace(`Add Config Data | CPRActorSheet | Called with ${this}.`);
    sheetData.skillCategories = CPR.skillCategories;
    sheetData.statList = CPR.statList;
    sheetData.skillDifficulties = CPR.skillDifficulties;
    sheetData.skillList = CPR.skillList;
    sheetData.roleAbilityList = CPR.roleAbilityList;
    sheetData.roleList = CPR.roleList;
    sheetData.weaponTypeList = CPR.weaponTypeList;
    sheetData.ammoVariety = CPR.ammoVariety;
  }

  _calculateDerivedStats() {
    // Calculate MAX HP
    hp.max = 10 + 5 * (Math.ceil((will.value + body.value) / 2));
    if (hp.value > hp.max) hp.value = hp.max;

    // Humanity
    hum.max = 10 * emp.value;
    if (hum.value > hum.max) hum.value = hum.max;

    // Seriously wounded
    data.data.derivedStats.seriouslyWounded = Math.ceil(hp.max / 2);

    // Death save
    deathSave.max = body.value;
    if (deathSave.value > deathSave.max) deathSave.value = deathSave.max;
  }

  async _onRoll(event) {
    LOGGER.trace(`Actor _onRoll | .rollable click | Called.`);

    // TODO - Cleaner way to init all this fields?
    // TODO - Create a input object to encompass these fields?
    let totalMods = [0];
    let statValue = 0;
    let skillValue = 0;
    let rollCritical = true;
    
    let rollType = $(event.currentTarget).attr("data-roll-type");
    let rollTitle = $(event.currentTarget).attr("data-roll-title");
    const itemId = this._getItemId(event);

    // Do I need this?
    let actorData = this.getData();

    if (!event.ctrlKey) {
      totalMods.push(await RollModiferPromptDiag());
    }

    switch (rollType) {
      case "stat": {
        statValue = actorData.data.stats[rollTitle].value;
        LOGGER.trace(`Actor _onRoll | rolling stat: ` + rollTitle + ` | ` + statValue);
        break;
      }
      case "skill": {
        const item = this.actor.items.find(i => i.data._id == itemId);
        statValue = actorData.data.stats[item.data.data.stat].value;
        skillValue = item.data.data.level;
        LOGGER.trace(`Actor _onRoll | rolling skill: ` + rollTitle + ` | ` + skillValue);
        break;
      }
      case "roleAbility": {
        const roleInfo = actorData.data.roleInfo;
        const role = roleInfo["role"];
        skillValue = roleInfo.roleskills[role][rollTitle];
        LOGGER.trace(`Actor _onRoll | rolling ability: ` + rollTitle + ` | ` + skillValue);
        break;
      }
    }

    RollCard(BaseRoll(statValue, skillValue, totalMods, rollCritical));
  }

  _updateItem(event) {
    LOGGER.trace(`Actor _itemUpdate | .item-edit click | Called.`);
    let itemId = this._getItemId(event);
    const item = this.actor.items.find(i => i.data._id == itemId)
    item.sheet.render(true);
  }

  _getItemId(event) {
    return $(event.currentTarget).attr("data-item-id")
  }

  _deleteOwnedItem(event) {
    LOGGER.trace(`Actor _deleteOwnedItem | .item-delete click | Called.`);
    let itemId = this._getItemId(event);
    let itemList = this.actor.items;
    itemList.forEach(item => { if (item.data._id === itemId) item.delete() });
  }

  _addSkill(event) {
    LOGGER.trace(`Actor _addSkill | .add-skill click | called.`);
    let itemData = {
      name: "skill", type: 'skill', data: {}
    };
    this.actor.createOwnedItem(itemData, { renderSheet: true })
  }
}

