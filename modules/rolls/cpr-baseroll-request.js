export default class CPRBaseRollRequest {
    constructor() {
        this.user = null;
        this.rollType = "stat" // stat, skill, role, init
        this.rollTitle = "";
        this.statValue = 0;
        this.skillValue = 0;
        this.roleValue = 0;
        this.calculateCritical = true;
        this.mods = [];
    }
};