import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to Programs.
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
    LOGGER.trace("setInstalled | CPRProgramItem | Called.");
    this.data.data.isInstalled = true;
  }

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  unsetInstalled() {
    LOGGER.trace("unsetInstalled | CPRProgramItem | Called.");
    this.data.data.isInstalled = false;
  }

  /**
   * Returns a boolean if the program is installed.
   *
   * @public
   */
  getInstalled() {
    LOGGER.trace("getInstalled | CPRProgramItem | Called.");
    return this.data.data.isInstalled;
  }

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  setRezzed() {
    LOGGER.trace("setRezzed | CPRProgramItem | Called.");
    this.data.data.isRezzed = true;
  }

  /**
   * Sets a program to uninstalled.
   *
   * @public
   */
  unsetRezzed() {
    LOGGER.trace("unsetRezzed | CPRProgramItem | Called.");
    this.data.data.isRezzed = false;
  }

  /**
   * Returns a boolean if the program is installed.
   *
   * @public
   */
  getRezzed() {
    LOGGER.trace("getRezzed | CPRProgramItem | Called.");
    return this.data.data.isRezzed;
  }
}
