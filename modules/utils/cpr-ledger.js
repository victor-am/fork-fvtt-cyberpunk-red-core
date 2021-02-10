/* global setProperty, getProperty, hasProperty */

import CPRSystemUtils from "./cpr-systemUtils.js";
import LOGGER from "../../utils/cpr-logger.js";

export default class CPRLedger {

  static isLedgerProperty(data, prop) {
    /**
     * Return whether a property in actor data is a ledgerProperty. This means it has
     * two (sub-)properties, "value", and "transactions".
     */
    LOGGER.trace("CPRLedger _checkProperty | CPRLedger | called.");
    const ledgerData = getProperty(data, prop);
    if (!hasProperty(ledgerData, "value")) {
      CPRSystemUtils.DisplayMessage("error", `Bug: Ledger property '${prop}' missing 'value'`);
      return false;
    }
    if (!hasProperty(ledgerData, "transactions")) {
      CPRSystemUtils.DisplayMessage("error", `Bug: Ledger property '${prop}' missing 'transactions'`);
      return false;
    }
    return true;
  }

}
