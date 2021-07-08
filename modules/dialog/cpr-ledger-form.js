/* globals FormApplication mergeObject duplicate */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
/**
 * Form application to display the ledger property.
 */
export default class CPRLedger extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: SystemUtils.Localize("CPR.ledger.title"),
      template: "systems/cyberpunk-red-core/templates/dialog/cpr-ledger-form.hbs",
      width: 600,
      height: 340,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  getData() {
    const data = {
      ledgername: this.ledgername,
      contents: this.contents,
    };
    return data;
  }

  setLedgerContent(name, contents) {
    LOGGER.trace("CPRLedger setLedgerContent | called.");
    // Generates the localization strings for "CPR.ledger.wealth" and "CPR.ledger.improvementpoints"
    // and maybe others in the future. This comment has been added to allow for automated checks
    // of localization strings in the code.
    this.ledgername = "CPR.ledger.".concat(name.toLowerCase());
    this.contents = duplicate(contents);
    this._makeLedgerReadable(name);
  }

  _makeLedgerReadable(name) {
    this.contents.forEach((element, index) => {
      const tmp = element[0].replace(name, "").trim();
      this.contents[index][0] = tmp[0].toUpperCase() + tmp.slice(1);
    });
  }

  close(options) {
    super.close(options);
  }
}
