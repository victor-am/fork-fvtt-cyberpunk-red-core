/* eslint-disable no-undef */
import SystemUtils from "./cpr-systemUtils.js";
import LOGGER from "./cpr-logger.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    LOGGER.trace("lawyer | Rules | called.");
    if (!rule) {
      SystemUtils.DisplayMessage("warn", msg);
    }
  }
}
