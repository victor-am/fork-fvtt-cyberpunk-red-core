/* eslint-disable no-undef */
import SystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    if (!rule) {
      SystemUtils.DisplayMessage("warn", msg);
    }
  }
}
