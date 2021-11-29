import * as CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the base CPRItem object with things specific to actor skills.
 * @extends {CPRItem}
 */
export default class CPRSkillItem extends CPRItem {
  /**
   * Set the skill value. Called when edited in the actor sheet.
   *
   * @callback
   * @param {Number} value
   */
  setSkillLevel(value) {
    LOGGER.trace("setSkillLevel | CPRSkillItem | Called.");
    this.getRollData().level = Math.clamped(-99, value, 99);
  }

  /**
   * Create a CPRRoll object with the right type and mods for this skill.
   *
   * @param {CPRActor} actor - the actor this skill is associated with
   * @returns {CPRRoll}
   */
  _createSkillRoll(actor) {
    LOGGER.trace("_createSkillRoll | CPRSkillItem | Called.");
    const itemData = this.data.data;
    const statName = itemData.stat;
    const niceStatName = SystemUtils.Localize(CPR.statList[statName]);
    const statValue = actor.getStat(statName);
    const skillName = this.name;
    const skillLevel = itemData.level;
    let roleName;
    let roleValue = 0;
    actor.data.filteredItems.role.forEach((r, index1) => {
      const roleSkillBonuses = actor.data.filteredItems.role.filter((role) => role.data.data.bonuses.some((b) => b.name === skillName));
      if (roleSkillBonuses.length > 0 && index1 === 0) {
        roleSkillBonuses.forEach((b, index2) => {
          if (roleName) {
            roleName += `, ${b.data.data.mainRoleAbility}`;
          } else if (index2 === 0) {
            roleName = b.data.data.mainRoleAbility;
          }
          roleValue += Math.floor(b.data.data.rank / b.data.data.bonusRatio);
        });
      }
      const subroleSkillBonuses = r.data.data.abilities.filter((a) => a.bonuses.some((b) => b.name === skillName));
      if (subroleSkillBonuses.length > 0) {
        subroleSkillBonuses.forEach((b, index3) => {
          if (roleName) {
            roleName += `, ${b.name}`;
          } else if (index3 === 0) {
            roleName = b.name;
          }
          roleValue += Math.floor(b.rank / b.bonusRatio);
        });
      }
    });
    const cprRoll = new CPRRolls.CPRSkillRoll(niceStatName, statValue, skillName, skillLevel, roleName, roleValue);
    cprRoll.addMod(actor.getArmorPenaltyMods(statName));
    cprRoll.addMod(actor.getWoundStateMods());
    cprRoll.addMod(this._getSkillMod());
    cprRoll.addMod(actor.getUpgradeMods(statName));
    cprRoll.addMod(actor.getUpgradeMods(skillName));
    cprRoll.addMod(actor.data.bonuses[skillName]); // active effects
    return cprRoll;
  }

  /**
   * We use temporary objects with keys derived from skill names elsewhere in the code base.
   * We need to be able to programmatically produce those keys from the name, and that is
   * what this method does.
   *
   * TODO: the cprSplitJoinCoreSkills handlebars helper has a lot of code that overlaps with this.
   * TODO: not sure returning just the name will work with localization
   *
   * @returns {String}
   */
  slugify() {
    LOGGER.trace("slugify | CPRSkillItem | Called.");
    return this.data.name;
    // return this.data.name.toLowerCase().replace(/\s+/g, "");
  }

  /**
   * Get the mod associated with this skill.
   *
   * @returns {Number}
   */
  _getSkillMod() {
    LOGGER.trace("_getSkillMod | CPRSkillItem | Called.");
    return this.data.data.skillmod;
  }
}
