export class LOGGER {
  static log(msg) {
    console.log(`CPR LOG | ${msg}`)
  };
  static debug(msg) {
    console.debug(`CPR DBG | ${msg}`)
  };
  static warn(msg) {
    console.warn(`CPR WRN | ${msg}`)
  };
  static error(msg) {
    console.error(`CPR ERR | ${msg}`)
  };
};