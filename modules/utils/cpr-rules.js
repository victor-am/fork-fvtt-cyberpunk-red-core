import CPRSystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule, msg) {
    if (!rule) {
      CPRSystemUtils.DisplayMessage("warn", "CPR.warningtoomanyhands");
    }
  };
};