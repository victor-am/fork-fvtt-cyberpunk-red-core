/* global duplicate game randomID */
import CPRItem from "../cpr-item.js";
import * as CPRRolls from "../../rolls/cpr-rolls.js";
import LOGGER from "../../utils/cpr-logger.js";

/**
 * Extend the base CPRItem object with things specific to cyberdecks.
 * @extends {CPRItem}
 */
export default class CPRCyberdeckItem extends CPRItem {
  /**
   * Cyberdeck Code
   *
   * The methods below apply to the CPRItem.type = "cyberdeck"
  */

  /**
   * Dynamically calculates the number of free slots on the Cyberdeck
   * by starting with the number of slots this cyberdeck has and substacting
   * the slot size of each of the installed programs.
   *
   * @public
   */
  availableSlots() {
    LOGGER.trace("availableSlots | CPRItem | Called.");
    const itemData = duplicate(this.data.data);
    let unusedSlots = 0;
    const upgradeValue = this.getAllUpgradesFor("slots");
    const upgradeType = this.getUpgradeTypeFor("slots");
    unusedSlots = (upgradeType === "override") ? upgradeValue : itemData.slots + upgradeValue;
    itemData.programs.installed.forEach((program) => {
      unusedSlots -= program.data.slots;
    });
    itemData.upgrades.forEach((u) => {
      unusedSlots -= u.data.size;
    });
    return unusedSlots;
  }

  /**
   * Returns a list of installed programs.  This is a list of ItemData as the
   * Item itself is not stored because Items can't own Items. As such, if you
   * are looking for a specific program, each Array entry has a entry._id of
   * the Object it represents.
   *
   * @public
   */
  getInstalledPrograms() {
    LOGGER.trace("getInstalledPrograms | CPRCyberdeckItem | Called.");
    return this.data.data.programs.installed;
  }

  /**
   * Returns a list of rezzed programs.  This is a list of ItemData as the
   * Item itself is not stored because Items can't own Items. As such, if you
   * are looking for a specific program, each Array entry has a entry._id of
   * the Object it represents.
   *
   * @public
   */
  getRezzedPrograms() {
    LOGGER.trace("getRezzedPrograms | CPRCyberdeckItem | Called.");
    return this.data.data.programs.rezzed;
  }

  /**
   * Install programs from the Cyberdeck
   *
   * @public
   * @param {Array} programs      - Array of CPRItem programs
   */
  installPrograms(programs) {
    LOGGER.trace("installPrograms | CPRCyberdeckItem | Called.");
    const { installed } = this.data.data.programs;
    programs.forEach((p) => {
      const onDeck = installed.filter((iProgram) => iProgram._id === p.data._id);
      if (onDeck.length === 0) {
        const programInstallation = p.data;
        programInstallation.data.isRezzed = false;
        installed.push(programInstallation);
        p.setInstalled();
      }
    });
    this.data.data.programs.installed = installed;
  }

  /**
   * Uninstall programs from the Cyberdeck
   *
   * @public
   * @param {Array} programs      - Array of CPRItem programs
   */
  uninstallPrograms(programs) {
    LOGGER.trace("uninstallPrograms | CPRCyberdeckItem | Called.");
    let { rezzed } = this.data.data.programs;
    let { installed } = this.data.data.programs;
    const tokenList = [];
    let sceneId;
    programs.forEach(async (program) => {
      if (program.data.data.class === "blackice" && this.isRezzed(program)) {
        const rezzedIndex = this.data.data.programs.rezzed.findIndex((p) => p._id === program.id);
        const programData = this.data.data.programs.rezzed[rezzedIndex];
        const cprFlags = programData.flags["cyberpunk-red-core"];
        if (cprFlags.biTokenId) {
          tokenList.push(cprFlags.biTokenId);
        }
        if (cprFlags.sceneId) {
          sceneId = cprFlags.sceneId;
        }
      }
      installed = installed.filter((p) => p._id !== program.id);
      rezzed = rezzed.filter((p) => p._id !== program.id);
      if ((typeof program.unsetInstalled === "function")) {
        program.unsetInstalled();
      }
    });
    this.data.data.programs.installed = installed;
    this.data.data.programs.rezzed = rezzed;

    if (tokenList.length > 0 && sceneId) {
      const sceneList = game.scenes.filter((s) => s.id === sceneId);
      if (sceneList.length === 1) {
        const [scene] = sceneList;
        return scene.deleteEmbeddedDocuments("Token", tokenList);
      }
    }
    return null;
  }

  /**
   * Return true/false if the program is Rezzed
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program to check
   */
  isRezzed(program) {
    LOGGER.trace("isRezzed | CPRCyberdeckItem | Called.");
    const rezzedPrograms = this.data.data.programs.rezzed.filter((p) => p._id === program.id);
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === program.data._id);
    const programState = installed[installIndex];
    programState.data.isRezzed = (rezzedPrograms.length > 0);
    installed[installIndex] = programState;
    this.data.data.programs.installed = installed;
    // Passed by reference
    // eslint-disable-next-line no-param-reassign
    program.data.isRezzed = (rezzedPrograms.length > 0);
    return (rezzedPrograms.length > 0);
  }

  /**
   * Rez a program by setting the isRezzed boolean on the program to true
   * and push the program onto the rezzed array of the Cyberdeck
   *
   * @public
   * @param {CPRItem} program      - CPRItem of the program to REZ
   */
  async rezProgram(program, callingToken) {
    LOGGER.trace("rezProgram | CPRCyberdeckItem | Called.");
    const programData = duplicate(program.data);
    const { installed } = this.data.data.programs;
    const installIndex = installed.findIndex((p) => p._id === programData._id);
    const programState = installed[installIndex];
    // This instance ID is being added pro-actively because the rulebook
    // is a bit fuzzy on the bottom of Page 201 with regards to rezzing the
    // same program multiple times.  The rulebook says:
    // "You can run multiple copies of the same Program on your Cyberdeck"
    // however when I asked on the Discord, I was told you can not do this,
    // you have to install a program twice on the Cyberdeck if you want to
    // rez it twice.  So the code here supports what was told to me in Discord.
    // If it ever comes back that a single install of a program can be run
    // multiple times, we will already have a an instance ID to differentiate
    // the different rezzes.
    const rezzedInstance = randomID();
    program.setFlag("cyberpunk-red-core", "rezInstanceId", rezzedInstance);
    programState.data.isRezzed = true;
    installed[installIndex] = programState;
    if (programData.data.class === "blackice") {
      await this._rezBlackIceToken(programData, callingToken);
    }
    this.data.data.programs.installed = installed;
    this.data.data.programs.rezzed.push(programData);
  }

  /**
   * Get total modifiers for a specified boosterType from the programs rezzed on the Cyberdeck.
   *
   * @public
   * @param {String} boosterType - string defining the type of boosters to return.
   */
  getBoosters(boosterType) {
    LOGGER.trace("getBoosters | CPRCyberdeckItem | Called.");
    const { rezzed } = this.data.data.programs;
    let modifierTotal = 0;
    switch (boosterType) {
      case "attack": {
        rezzed.forEach((program) => {
          if (typeof program.data.atk === "number" && program.data.class !== "blackice") {
            modifierTotal += program.data.atk;
          }
        });
        break;
      }
      case "defense": {
        rezzed.forEach((program) => {
          if (typeof program.data.def === "number" && program.data.class !== "blackice") {
            modifierTotal += program.data.def;
          }
        });
        break;
      }
      default: {
        rezzed.forEach((program) => {
          if (program.data.modifiers[boosterType] && program.data.class !== "blackice") {
            modifierTotal += program.data.modifiers[boosterType];
          }
        });
      }
    }
    return modifierTotal;
  }

  _createCyberdeckRoll(rollType, actor, extraData = {}) {
    LOGGER.trace("_createCyberdeckRoll | CPRCyberdeckItem | Called.");
    let rollModifiers = 0;
    let cprRoll;
    const { programId } = extraData;
    const programList = this.getInstalledPrograms().filter((iProgram) => iProgram._id === programId);
    let program = (programList.length > 0) ? programList[0] : null;
    let damageFormula = (program === null) ? "1d6" : program.data.damage.standard;
    if (program.data.class === "blackice") {
      const rezzedList = this.getRezzedPrograms().filter((rProgram) => rProgram._id === programId);
      program = (rezzedList.length > 0) ? rezzedList[0] : null;
      if (program.data.blackIceType === "antiprogram") {
        damageFormula = program.data.damage.blackIce;
      }
    }
    if (program === null) {
      LOGGER.error(`_createCyberdeckRoll | CPRCyberdeckItem | Unable to locate program ${programId}.`);
      return CPRRolls.CPRRoll("Unknown Program", "1d10");
    }
    const skillName = "";
    const skillValue = 0;
    const roleName = (program.data.class === "blackice") ? "Black ICE" : extraData.netRoleItem.data.data.mainRoleAbility;
    const roleValue = (program.data.class === "blackice") ? 0 : extraData.netRoleItem.data.data.rank;
    const atkValue = (program === null) ? 0 : program.data.atk;
    const pgmName = (program === null) ? "Program" : program.name;
    const { executionType } = extraData;
    rollModifiers = (program.data.class === "blackice") ? 0 : this.getBoosters(executionType);
    switch (executionType) {
      case "atk":
      case "def": {
        const niceName = executionType.toUpperCase();
        cprRoll = (program.data.class === "blackice") ? new CPRRolls.CPRStatRoll(niceName, program.data[executionType]) : new CPRRolls.CPRAttackRoll(
          pgmName,
          niceName,
          atkValue,
          skillName,
          skillValue,
          roleName,
          roleValue,
          "program",
        );
        cprRoll.rollCardExtraArgs.program = program;
        break;
      }
      case "damage": {
        cprRoll = new CPRRolls.CPRDamageRoll(program.name, damageFormula, "program");
        cprRoll.rollCardExtraArgs.pgmClass = program.data.class;
        cprRoll.rollCardExtraArgs.pgmDamage = program.data.damage;
        cprRoll.rollCardExtraArgs.program = program;
        break;
      }
      default:
    }
    cprRoll.setNetCombat(pgmName);
    cprRoll.addMod(rollModifiers);
    cprRoll.addMod(actor.getWoundStateMods());
    return cprRoll;
  }
}
