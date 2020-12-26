import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";
import { baseRoll } from "../../system/dice.js";

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
  }
  
  _calculateDerivedStats() {
      // Calculate MAX HP
      hp.max = 10 + 5*(Math.ceil((will.value + body.value) / 2));
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

  _onRoll(event) {
    LOGGER.trace(`Actor _onRoll | .rollable click | Called.`);
    let actorData = this.getData();
    const id = this._getItemId(event);
    baseRoll(6, 6, [2, -3], true);
    // Get actor, get Item?
  }

  _itemUpdate(event) {
    LOGGER.trace(`Actor _itemUpdate | .item-edit click | Called.`);
    let itemId = this._getItemId(event);
    const item = this.actor.items.find(i => i.data._id == itemId)
    item.sheet.render(true);
  }

  _getItemId(event) {
    return $(event.currentTarget).attr("data-item-id")
  }
}

