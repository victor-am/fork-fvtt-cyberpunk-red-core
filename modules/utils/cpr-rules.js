/* eslint-disable no-undef */
import CPRSystemUtils from "./cpr-systemUtils.js";

export default class Rules {
  static lawyer(rule = false, msg) {
    if (!rule) {
      CPRSystemUtils.DisplayMessage("warn", msg);
    }
  }

  static validRole(actor, data) {
    const newRoleData = data.data.roleInfo;
    const changedRoles = newRoleData.roles;
    let roleValid = true;
    if ("solo" in changedRoles || "tech" in changedRoles || "medtech" in changedRoles) {
      const currentRoleData = actor.data.data.roleInfo;
      mergeObject(currentRoleData, newRoleData);
      let abilityRank = 0;
      let subskillRank = 0;
      Object.keys(changedRoles).forEach((role) => {
        const roleSkills = currentRoleData.roleskills[role];
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
