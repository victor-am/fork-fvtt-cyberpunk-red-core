/* globals FormApplication mergeObject duplicate */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
/**
 * Form application to display the ledger property.
 */
export default class CPRLedger extends FormApplication {
  static get defaultOptions() {
    LOGGER.trace("defaultOptions | CPRLedger | called.");
    return mergeObject(super.defaultOptions, {
      title: SystemUtils.Localize("CPR.ledgertitle"),
      template: "systems/cyberpunk-red-core/templates/dialog/cpr-ledger-form.hbs",
      width: 500,
      height: 340,
    });
  }

  activateListeners(html) {
    LOGGER.trace("activateListeners | CPRLedger | called.");
    super.activateListeners(html);
  }

  getData() {
    LOGGER.trace("getData | CPRLedger | called.");
    const data = {
      ledgername: this.ledgername,
      contents: this.contents,
    };
    return data;
  }

  setLedgerContent(name, contents) {
    LOGGER.trace("setLedgerContent | CPRLedger | called.");
    // Generates the localization strings for "CPR.ledger.wealth" and "CPR.ledger.improvementpoints"
    // and maybe others in the future. This comment has been added to allow for automated checks
    // of localization strings in the code.
    this.ledgername = "CPR.ledger".concat(name.toLowerCase());
    this.contents = duplicate(contents);
    this._makeLedgerReadable(name);
  }

  _makeLedgerReadable(name) {
    LOGGER.trace("_makeLedgerReadable | CPRLedger | called.");
    this.contents.forEach((element, index) => {
      const tmp = element[0].replace(name, "").trim();
      this.contents[index][0] = tmp[0].toUpperCase() + tmp.slice(1);
    });
  }

  close(options) {
    LOGGER.trace("close | CPRLedger | called.");
    super.close(options);
  }
}
