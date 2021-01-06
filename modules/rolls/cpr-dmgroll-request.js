export default class CPRDmgRollRequest {
    constructor() {
        this.user = null;
        this.rollType = "damage" 
        this.formula = "0d6";
        this.rollTitle = "";
        this.weaponSkill = "";
        this.weaponType = "";
        this.mods = [];
        this.location = "body";
    }
};