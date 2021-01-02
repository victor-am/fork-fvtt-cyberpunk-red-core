import LOGGER from "./cpr-logger.js";
import { CPR } from "../system/config.js";

export default class CPRConfigUtils {

  static async AddConfigData(data) {
    LOGGER.trace(`AddConfigData | ActorUtils | called.`)
    data.cpr = CPR;
  }
}