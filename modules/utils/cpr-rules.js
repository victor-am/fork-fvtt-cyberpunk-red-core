import CPRSystemUtils from "./cpr-systemUtils";

export default class Rules {
  static lawyer(rule = false, msg) {
    if (!rule) {
      CPRSystemUtils.DisplayMessage("warn", msg);
    }
  }
}
