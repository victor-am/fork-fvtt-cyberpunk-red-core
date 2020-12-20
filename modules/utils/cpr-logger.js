export default class LOGGER {
  static log(msg) {
    console.log(`CPR LOG | ${msg}`);
  };
  static debug(msg) {
    console.log(`CPR DBG | ${msg}`);
  };
  static warn(msg) {
    console.log(`CPR WRN | ${msg}`);
  };
  static trace(msg) {
    console.log(`CPR TRC | ${msg}`);
  };
  static error(msg) {
    console.log(`CPR ERR | ${msg}`);
  };

  static credits() {
    console.log(`SPECIAL THANKS TO MOO MAN FOR HIS PATIENCE AND HELP!`)
    console.log(`
          (__)             (__)             (__)             (__)
          (oo)             (oo)             (oo)             (oo)
   /-------\\/       /-------\\/       /-------\\/       /-------\\/
  / |     ||       / |     ||       / |     ||       / |     ||
 *  ||----||      *  ||W---||      *  ||w---||      *  ||V---||
    ^^    ^^ 
    `)
  }
};