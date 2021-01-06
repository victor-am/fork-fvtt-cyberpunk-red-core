export default class CPRDmgRollRequest {
    constructor() {
        // What's this?
        this.user = null;

        // To change the flow of _onRoll()
        this.rollType = "damage" 
        
        this.formula = "0d6";
        this.rollTitle = "";
        this.attackSkill = "";
        this.weaponType = "";
        this.mods = [];
        this.location = "body";
        this.isRanged = true;

    }
};