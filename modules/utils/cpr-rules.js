/* eslint-disable no-undef */
import CPRSystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    if (!rule) {
      CPRSystemUtils.DisplayMessage("warn", msg);
    }
  }

  static validRole(actor, data) {
    let roleValid = true;
    const roleData = actor.data.data.roleInfo;

    if (typeof data !== "undefined") {
      if (typeof data.data.roleInfo !== "undefined") {
        const newRoleData = data.data.roleInfo;
        mergeObject(roleData, newRoleData);
      }
    }

    const validateRoles = roleData.roles;

    if (validateRoles.includes("solo") || validateRoles.includes("tech") || validateRoles.includes("medtech")) {
      let abilityRank = 0;
      let subskillRank = 0;
      validateRoles.forEach((role) => {
        const roleSkills = roleData.roleskills[role];
        Object.keys(roleSkills).forEach((roleSkill) => {
          if (roleSkill === "subSkills") {
            Object.keys(roleSkills.subSkills).forEach((subSkill) => {
              subskillRank += roleSkills.subSkills[subSkill];
            });
          } else {
            abilityRank = roleSkills[roleSkill];
          }
        });
        // Normalize, after this, abilityRank should equal subskillRank otherwise invalid
        switch (role) {
          case "tech": {
            abilityRank *= 2;
            break;
          }
          case "medtech":
          case "solo":
          default:
        }
        if (abilityRank < subskillRank) {
          roleValid = false;
        }
      });
    }
    return roleValid;
  }
}
