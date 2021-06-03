/* globals FormApplication mergeObject */
import LOGGER from "../utils/cpr-logger.js";
import SystemUtils from "../utils/cpr-systemUtils.js";
/**
 * Form application to display the ledger property.
 */
export default class CPRLedger extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: SystemUtils.Localize("CPR.ledgertitle"),
      template: "systems/cyberpunk-red-core/templates/dialog/cpr-ledger-form.hbs",
      width: 500,
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
    this.ledgername = "CPR.ledger".concat(name.toLowerCase());
    this.contents = contents;
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
