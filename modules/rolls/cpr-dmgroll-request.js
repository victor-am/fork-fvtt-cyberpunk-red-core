export default class CPRDmgRollRequest {
    constructor() {
        // What's this?
        this.user = null;

        // To change the flow of _onRoll()
        this.rollType = "damage" 

        this.mods = [];
        this.location = "body";
        this.isRanged = true;
        this.ablates = true;
        this.ignoreSP = "none";
    }
};