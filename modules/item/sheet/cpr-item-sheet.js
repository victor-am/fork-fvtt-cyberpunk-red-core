import LOGGER from "../../utils/cpr-logger.js";
import {CPR} from "../../system/config.js";

/**
 * Extend the basic ActorSheet.
 * @extends {ItemSheet}
 */
export default class CPRItemSheet extends ItemSheet {

  /* -------------------------------------------- */
  /** @override */
  static get defaultOptions() {
    LOGGER.trace("Default Options | CPRItemSheet | Called.");
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }],
      width: 450,
      height: 300,
    });
  }

  get template() {
    LOGGER.trace(`Get Template | CPRItemSheet | Called with type ${this.item.type}.`);
    return `systems/cyberpunk-red-core/templates/item/cpr-${this.item.type}-sheet.hbs`;
  }

  get classes() {
    LOGGER.trace(`Get Classes | CPRItemSheet | Called with type ${this.item.type}.`);
    return super.defaultOptions.classes.concat(["sheet", "item", `${this.item.type}`]);
  }

  /* -------------------------------------------- */
  /** @override */
  getData() {
    const data = super.getData();
    this.addConfigData(data);
    // data.isGM = game.user.isGM;
    return data;
  }


  /* -------------------------------------------- */
  addConfigData(sheetData) {
    LOGGER.trace(`Add Config Data | CPRItemSheet | Called with type ${this.item.type}.`);
    sheetData.skillCategories = CPR.skillCategories;
    sheetData.statList = CPR.statList;
    sheetData.skillDifficulties = CPR.skillDifficulties;
    sheetData.skillDifficulties = CPR.skillList;
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
      LOGGER.trace(`Item Listener Called | .checkbox click | Called with type ${this.item}.`);
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

  }

}