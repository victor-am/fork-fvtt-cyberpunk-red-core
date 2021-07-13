/* eslint-disable no-undef */
import SystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    LOGGER.trace("lawyer | Rules | called.");
    if (!rule) {
      SystemUtils.DisplayMessage("warn", msg);
    }
  }

  static validRole(actor, data) {
    LOGGER.trace("validRole | Rules | called.");
    let roleValid = true;
    const roleData = actor.data.data.roleInfo;
    if (typeof data !== "undefined") {
      if (typeof data.data !== "undefined") {
        if (typeof data.data.roleInfo !== "undefined") {
          const newRoleData = data.data.roleInfo;
          mergeObject(roleData, newRoleData);
        }
      }
    }

    const validateRoles = roleData.roles;

    if (validateRoles.includes("solo") || validateRoles.includes("tech") || validateRoles.includes("medtech")) {
      validateRoles.forEach((role) => {
        let abilityRank = 0;
        let subskillRank = 0;
        const roleSkills = roleData.roleskills[role];
        Object.keys(roleSkills).forEach((roleSkill) => {
          if (roleSkill === "subSkills") {
            Object.keys(roleSkills.subSkills).forEach((subSkill) => {
              if (subSkill === "surgery") {
                subskillRank += roleSkills.subSkills[subSkill] / 2;
              } else {
                subskillRank += roleSkills.subSkills[subSkill];
              }
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
