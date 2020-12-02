import { CPRActorSheet } from "./cpr-actor-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CPRMookActorSheet extends CPRActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["sheet", "actor"],
      template: "systems/cyberpunk-red-core/templates/actor/cpr-mook-sheet.html",
      width: 600,
      height: 600,
      tabs: [],
      scrollY: []
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if ( !this.options.editable ) return;
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    // formData = EntitySheetHelper.updateAttributes(formData, this);
    // formData = EntitySheetHelper.updateGroups(formData, this);
    // return this.object.update(formData);
  }

}
