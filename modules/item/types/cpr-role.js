import * as CPRRolls from "../../rolls/cpr-rolls.js";
import CPR from "../../system/config.js";
import CPRItem from "../cpr-item.js";
import LOGGER from "../../utils/cpr-logger.js";
import SystemUtils from "../../utils/cpr-systemUtils.js";

/**
 * Extend the base CPRItem object with things specific to character roles.
 *
 * @extends {CPRItem}
 */
export default class CPRRoleItem extends CPRItem {
  /**
   * Create a CPRRole object appropriate for rolling an ability associated with this role
   *
   * @param {String} rollType - an identifier for the type of role roll being performed
   * @param {CPRCharacterActor} actor - the actor associated with this role item
   * @param {Object} rollInfo - magic object with more role configuration data
   * @returns {CPRRoll}
   */
  _createRoleRoll(rollType, actor, rollInfo) {
    LOGGER.trace("_createRoleRoll | CPRItem | Called.");
    const itemData = this.data.data;
    let roleName = itemData.mainRoleAbility;
    let rollTitle;
    let statName = "--";
    let skillName = "--";
    let skillList;
    let roleValue = 0;
    let statValue = 0;
    let skillValue = 0;
    let boosterModifiers;
    switch (rollType) {
      case CPRRolls.rollTypes.INTERFACEABILITY: {
        roleName = rollInfo.netRoleItem.data.data.mainRoleAbility;
        roleValue = rollInfo.netRoleItem.data.data.rank;
        const { interfaceAbility } = rollInfo;
        const { cyberdeck } = rollInfo;
        switch (interfaceAbility) {
          case "speed": {
            rollTitle = SystemUtils.Localize("CPR.global.generic.speed");
            break;
          }
          case "defense": {
            rollTitle = SystemUtils.Localize("CPR.global.generic.defense");
            break;
          }
          default: {
            rollTitle = SystemUtils.Localize(CPR.interfaceAbilities[interfaceAbility]);
          }
        }

        boosterModifiers = cyberdeck.getBoosters(interfaceAbility);
        break;
      }
      case CPRRolls.rollTypes.ROLEABILITY: {
        if (rollInfo.rollSubType === "mainRoleAbility") {
          if (itemData.addRoleAbilityRank) {
            roleValue = itemData.rank;
          }
          if (itemData.stat !== "--") {
            statName = itemData.stat;
            statValue = actor.getStat(statName);
          }
          if (itemData.skill !== "--" && itemData.skill !== "varying") {
            skillName = itemData.skill;
            const skillObject = actor.data.filteredItems.skill.find((i) => skillName === i.data.name);
            if (skillObject !== undefined) {
              skillValue = skillObject.data.data.level + skillObject.data.data.skillmod;
            } else {
              SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.noskillbythatname"));
            }
          } else if (itemData.skill === "varying") {
            skillName = "varying";
            if (itemData.stat !== "--") {
              skillList = actor.data.filteredItems.skill.filter((s) => s.data.data.stat === itemData.stat);
            } else {
              skillList = actor.data.filteredItems.skill;
            }
          }
        }

        if (rollInfo.rollSubType === "subRoleAbility") {
          const subRoleAbility = itemData.abilities.find((a) => a.name === rollInfo.subRoleName);
          roleName = subRoleAbility.name;
          roleValue = subRoleAbility.rank;
          if (subRoleAbility.stat !== "--") {
            statName = subRoleAbility.stat;
            statValue = actor.getStat(statName);
          }
          if (subRoleAbility.skill !== "--" && subRoleAbility.skill !== "varying") {
            skillName = subRoleAbility.skill.name;
            const skillObject = actor.data.filteredItems.skill.find((i) => skillName === i.data.name);
            if (skillObject !== undefined) {
              skillValue = skillObject.data.data.level + skillObject.data.data.skillmod;
            } else {
              SystemUtils.DisplayMessage("error", SystemUtils.Localize("CPR.noskillbythatname"));
            }
          } else if (subRoleAbility.skill === "varying") {
            skillName = "varying";
            if (subRoleAbility.stat !== "--") {
              skillList = actor.data.filteredItems.skill.filter((s) => s.data.data.stat === subRoleAbility.stat);
            } else {
              skillList = actor.data.filteredItems.skill;
            }
          }
        }
        break;
      }
      default:
    }
    const cprRoll = new CPRRolls.CPRRoleRoll(roleName, roleValue, skillName, skillValue, statName, statValue, skillList);
    if (rollType === "interfaceAbility") {
      cprRoll.setNetCombat(rollTitle);
      cprRoll.addMod(boosterModifiers);
    }
    cprRoll.addMod(actor.getWoundStateMods());
    return cprRoll;
  }
}
