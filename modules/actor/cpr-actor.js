import LOGGER from "../utils/cpr-logger.js";
import ActorUtils from "../utils/cpr-actorUtils.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class CPRActor extends Actor {

  /** @override */
  prepareData() {
    LOGGER.trace("prepareData | CPRActor | Called.");
    LOGGER.debug(this);
    super.prepareData();
    const actorData = this.data;
    actorData.filteredItems = this.itemTypes;

    LOGGER.debug("Prepare Character Data | CPRActor | Checking on contents of `filteredItems`.");

    
    // Prepare data for both types
    this._calculateDerivedStats(actorData);

    // Prepare type data
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'mook') this._prepareMookData(actorData); 
  }

  /** @override */
  getRollData() {
    LOGGER.trace("getRollData | CPRActor | Called.");
    const data = super.getRollData();
    return data;
  }

  /** @override */
  static async create(data, options) {
    LOGGER.trace(`create | CPRActor | called.`);
    data.items = [
      {
        "name": "meleeWeapon",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "dex",
          "category": "fightingSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "wardrobeAndStyle",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "persuasion",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "stealth",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "dex",
          "category": "bodySkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "forgery",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "pilotSeaVehicle",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "controlSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "paintOrDrawOrSculpt",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "riding",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "controlSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "wildernessSurvival",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "endurance",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "will",
          "category": "bodySkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "weaponsTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "humanPerception",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "emp",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "demolitions",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "athletics",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "dex",
          "category": "bodySkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "bureaucracy",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "science",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "lipReading",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "awarenessSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "heavyWeapons",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "rangedweaponSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "martialArts",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "dex",
          "category": "fightingSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "dance",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "dex",
          "category": "bodySkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "contortionist",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": null,
          "category": null,
          "difficulty": null,
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "tracking",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "awarenessSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "streetWise",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "perception",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "int",
          "category": "awarenessSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "concealOrRevealObject",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "awarenessSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "_id": "L6ctV61efyhJNpIA",
        "name": "firstAid",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "personalGrooming",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "composition",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "handgun",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "rangedweaponSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "interrogation",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "archery",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "rangedweaponSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "librarySearch",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "resistTortureOrDrugs",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "will",
          "category": "bodySkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "bribery",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "landVehicleTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "tactics",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "acting",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "performanceSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "evasion",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "dex",
          "category": "fightingSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "gamble",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "pickLock",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "cryptography",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "photographyAndFilm",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "trading",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "cool",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "autofire",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "rangedweaponSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "driveLandVehicle",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "controlSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "cyberTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "pilotAirVehicle",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "controlSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "accounting",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "pickPocket",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "paramedic",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "animalHandling",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "_id": "hmzhqoTinH9jaJjA",
        "name": "electronicsAndSecurityTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "difficult",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "basicTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "_id": "lThH4EZAqapT8gy2",
        "name": "brawling",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "dex",
          "category": "fightingSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "_id": "px5NeKd4nJ9I2moj",
        "name": "conversation",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "emp",
          "category": "socialSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "shoulderArms",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "ref",
          "category": "rangedweaponSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "education",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "seaVehicleTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "localExpert",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 4,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "language",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "criminology",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "playInstrument",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "performanceSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "airVehicleTech",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "tech",
          "category": "techniqueSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "concentration",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 2,
          "stat": "will",
          "category": "awarenessSkills",
          "difficulty": "typical",
          "basic": true,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      },
      {
        "name": "deduction",
        "type": "skill",
        "data": {
          "tags": [],
          "description": "",
          "source": "",
          "level": 0,
          "stat": "int",
          "category": "educationSkills",
          "difficulty": "typical",
          "basic": false,
          "core": true
        },
        "img": "icons/svg/mystery-man.svg"
      }
    ];
    // switch (data.type) {
    //   default: data.items = data.items.concat(await ActorUtils.GetAllSkills());
    // }
    super.create(data, options);
  }

  _prepareCharacterData(actorData) {
    LOGGER.trace("_prepareCharacterData | CPRActor | Called.");
    const data = actorData.data;
    LOGGER.trace("_prepareCharacterData | CPRActor | Checking on contents of `actorData.data`.");
  }

  _prepareMookData(actorData) {
    LOGGER.trace("_prepareMookData | CPRActor | Called.");
    const data = actorData.data;
    LOGGER.trace("_prepareMookData | CPRActor | Checking on contents of `actorData.data`.");
  }

  _calculateDerivedStats(actorData) {
    // Calculate MAX HP
    LOGGER.trace(`_calculateDerivedStats | CPRActor | Called.`);
    let stats = actorData.data.stats;
    let derivedStats = actorData.data.derivedStats;
    let humanity = actorData.data.humanity

    // Set max HP
    derivedStats.hp.max = 10 + 5*(Math.ceil((stats.will.value + stats.body.value) / 2));
    if (derivedStats.hp.value > derivedStats.hp.max) { derivedStats.hp.value = derivedStats.hp.max; };

    // Seriously wounded
    derivedStats.seriouslyWounded = Math.ceil(derivedStats.hp.max / 2);

    // Death save
    derivedStats.deathSave = stats.body.value;
    
    // Max Humanity
    // TODO-- Subtract installed cyberware...
    humanity.max = 10 * stats.emp.max;
    if (humanity.value > humanity.max) { humanity.value = humanity.max; };
    // Setting EMP to value based on current humannity.
    stats.emp.value = Math.floor(humanity.value / 10);
  }
}
