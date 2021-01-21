import CPRSystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    if (!rule) {
      CPRSystemUtils.DisplayMessage("warn", msg);
    }
  }
}
