/* eslint-disable no-undef */
export default class CPRRollRequest {
  constructor(event) {
    this.user = null;
    this.rollTitle = $(event.currentTarget).attr("data-roll-title");
    this.rollType = $(event.currentTarget).attr("data-roll-type");
    this.calculateCritical = true;
    this.stat = "";
    this.statValue = 0;
    this.skill = "";
    this.skillValue = 0;
    this.roleAbility = "";
    this.roleAbilityValue = 0;
    this.mods = [];
    this.isAimed = false;
    this.location = "body";
    this.isRanged = false;
    this.fireMode = "single";
    this.weaponType = "";
    this.debug = false;
    this.extraVars = [];
  }
}
