import LOGGER from "./cpr-logger.js";
// Anyone know why we even have this?
export default class CPRArrayUtils {
  static PushMultipleNumbersFromString(array, string, delims) {
    LOGGER.trace("PushMultipleNumbersFromString | CPRArrayUtils | Called.");
    array.push(...string.split(new RegExp(delims.join("|"), "")));
    const result = array.map((x) => parseInt(x, 10));
    return result;
  }
}
