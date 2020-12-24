import LOGGER from "../../utils/cpr-logger.js";
import { CPR } from "../../system/config.js";

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
    LOGGER.debug(this);
  }

  _onRoll(event) {
    LOGGER.trace(`Actor _onRoll | .rollable click | Called.`);
    console.log(event);
    const button = event.currentTarget;
    console.log(button);
    // Get actor, get Item?
  }
}

