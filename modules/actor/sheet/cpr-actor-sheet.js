import LOGGER from "../../utils/cpr-logger.js";
import {CPR} from "../../system/config.js";

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
    this.addConfigData(data);
    // data.isGM = game.user.isGM;
    return data;
  }


  /* -------------------------------------------- */
  addConfigData(sheetData) {
    LOGGER.trace(`Add Config Data | CPRActorSheet | Called with ${this}.`);
    sheetData.skillCategories = CPR.skillCategories;
    sheetData.statList = CPR.statList;
    sheetData.skillDifficulties = CPR.skillDifficulties;
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;
    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    // item sheet -> object assigned (item)
    html.find(".item-checkbox").click(ev => {
      LOGGER.trace(`Actor Listener Called | .checkbox click | Called with ${this}.`);
      // Duplcate item object for work
      let itemData = duplicate(this.item.data)
      // ID our target value to change
      let target = $(ev.currentTarget).attr("data-target")
      // If target exists, attempt to setProperty for target of itemData
      if (hasProperty(itemData, target)) {
        setProperty(itemData, target, !getProperty(itemData, target))
        this.item.update(itemData);
      }
    });

    html.find(".rollable").click(this._onRoll.bind(this));

  }

  _onRoll(event) {
    LOGGER.trace(`Actor _onRoll | .rollable click | Called with ${this}.`);
    const button = event.currentTarget;
    switch( button.dataset.action ) {
      case "makeSkillRoll":
        let roll = this.actor.rollStat(button.dataset.name);
        LOGGER.trace(`Roll result: ` + roll.result);
    }
  }
}

