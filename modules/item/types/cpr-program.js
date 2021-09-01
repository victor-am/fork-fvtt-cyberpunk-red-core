import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to actor critical injuries.
 * @extends {CPRItem}
 */
export default class CPRProgramItem extends CPRItem {
  /**
   * Program Code
   *
   * The methods below apply to the CPRItem.type = "program"
  */

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  setInstalled() {
    LOGGER.trace("setInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = true;
  }

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  unsetInstalled() {
    LOGGER.trace("unsetInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return;
    }
    this.data.data.isInstalled = false;
  }

  /**
   * Returns a boolean if the program is installed.
   *
   * @public
   */
  getInstalled() {
    LOGGER.trace("getInstalled | CPRItem | Called.");
    if (this.data.type !== "program") {
      return null;
    }
    return this.data.data.isInstalled;
  }
}
