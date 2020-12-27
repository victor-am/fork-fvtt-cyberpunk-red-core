import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";
import { baseRoll } from "../../system/dice.js";
import CPRItem from "../../item/cpr-item.js";
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
    LOGGER.trace("Get Data | CPRActorSheet | Called.");
    const data = super.getData();
    this._addConfigData(data);
    this._calculateDerivedStats(data);
    // data.isGM = game.user.isGM;

    return data;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Only on edit below here...
    if (!this.options.editable) return;
    
    // Moo Man Maigc...
    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    html.find(".rollable").click(this._onRoll.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(this._updateItem.bind(this));
    
    // delete item
    html.find('.item-delete').click(this._deleteOwnedItem.bind(this));

    // add a new skill from sheet
    html.find('.add-skill').click(this._addSkill.bind(this));
  }


  /*
  INTERNAL METHODS BELOW HERE
  */

  /* -------------------------------------------- */
  _addConfigData(sheetData) {
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
  
  _calculateDerivedStats(data) {
    // Calculate MAX HP
    let will = data.data.stats.will;
    let hp = data.data.derivedStats.hp;
    let body = data.data.stats.body;
    let hum = data.data.humanity;
    let emp = data.data.stats.emp;
    hp.max = 10 + 5*(Math.ceil((will.value + body.value) / 2));
    if (hp.value > hp.max) hp.value = hp.max;
    // Humanity
    hum.max = 10 * emp.value;
    if (hum.value > hum.max) hum.value = hum.max;
    // Seriously wounded
    data.data.derivedStats.seriouslyWounded = Math.ceil(hp.max / 2);
    // Death save
    data.data.derivedStats.deathSave = body.value;
  }

  _onRoll(event) {
    LOGGER.trace(`Actor _onRoll | .rollable click | Called.`);
    let actorData = this.getData();
    const itemId = this._getItemId(event);
    baseRoll(6, 6, [2, -3], true);
    // Get actor, get Item?
    console.log(this)
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
    itemList.forEach(item => {if (item.data._id === itemId) item.delete()});
  }

  _addSkill(event, itemData={name: 'skill', type: 'skill', data: {category: 'none', stat: 'none'}}) {
    LOGGER.trace(`Actor _addSkill | .add-skill click | called.`);
    const skillList = this.actor.data.filteredItems.skill;
    // determine if actor currently has a skill by name supplied in itemData
    let hasSkill = false;
    skillList.forEach(i => {
      hasSkill = i.data.name === itemData.name ? true : hasSkill; 
    });
    // If no skill data supplied, create blank skill and open skill info popup
    if (!hasSkill) {
      if (itemData.name === 'skill') {
        this.actor.createOwnedItem(itemData, {renderSheet: true});
      }
    // If skill info supplied add the skill
      else this.actor.createOwnedItem(itemData, {renderSheet: false});
    }
  }
}
