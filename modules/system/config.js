/**
 * config.js functions like a header file providing a bunch of constants used all over the code base.
 * In many ways they are like enums.
 */
const CPR = {};

// Sorted as shown on char sheet (with resources pushed to bottom)
CPR.statList = {
  int: "CPR.global.stats.int",
  ref: "CPR.global.stats.ref",
  dex: "CPR.global.stats.dex",
  tech: "CPR.global.stats.tech",
  cool: "CPR.global.stats.cool",
  will: "CPR.global.stats.will",
  move: "CPR.global.stats.move",
  body: "CPR.global.stats.body",
  luck: "CPR.global.stats.luck",
  emp: "CPR.global.stats.emp",
};

// Sorted A-Z
CPR.roleList = {
  exec: "CPR.global.role.exec.name",
  fixer: "CPR.global.role.fixer.name",
  lawman: "CPR.global.role.lawman.name",
  media: "CPR.global.role.media.name",
  medtech: "CPR.global.role.medtech.name",
  netrunner: "CPR.global.role.netrunner.name",
  nomad: "CPR.global.role.nomad.name",
  rockerboy: "CPR.global.role.rockerboy.name",
  solo: "CPR.global.role.solo.name",
  tech: "CPR.global.role.tech.name",
};

// Sorted A-Z
CPR.roleAbilityList = {
  backup: "CPR.global.role.lawman.ability.backup",
  charismaticImpact: "CPR.global.role.rockerboy.ability.charismaticImpact",
  combatAwareness: "CPR.global.role.solo.ability.combatAwareness",
  credibility: "CPR.global.role.media.ability.credibility",
  damageDeflection: "CPR.global.role.solo.ability.damageDeflection",
  fabricationExpertise: "CPR.global.role.tech.ability.fabricationExpertise",
  fieldExpertise: "CPR.global.role.tech.ability.fieldExpertise",
  fumbleRecovery: "CPR.global.role.solo.ability.fumbleRecovery",
  initiativeReaction: "CPR.global.role.solo.ability.initiativeReaction",
  interface: "CPR.global.role.netrunner.ability.interface",
  inventionExpertise: "CPR.global.role.tech.ability.inventionExpertise",
  maker: "CPR.global.role.tech.ability.maker",
  medicine: "CPR.global.role.medtech.ability.medicine",
  medtechCryo: "CPR.global.role.medtech.ability.medtechCryo",
  medtechPharma: "CPR.global.role.medtech.ability.medtechPharma",
  moto: "CPR.global.role.nomad.ability.moto",
  operator: "CPR.global.role.fixer.ability.operator",
  precisionAttack: "CPR.global.role.solo.ability.precisionAttack",
  spotWeakness: "CPR.global.role.solo.ability.spotWeakness",
  surgery: "CPR.global.role.medtech.ability.surgery",
  teamwork: "CPR.global.role.exec.ability.teamwork",
  threatDetection: "CPR.global.role.solo.ability.threatDetection",
  upgradeExpertise: "CPR.global.role.tech.ability.upgradeExpertise",
};

// Sorted A-Z
CPR.skillCategories = {
  awarenessSkills: "CPR.global.skillCategories.awarenessSkills",
  bodySkills: "CPR.global.skillCategories.bodySkills",
  controlSkills: "CPR.global.skillCategories.controlSkills",
  educationSkills: "CPR.global.skillCategories.educationSkills",
  fightingSkills: "CPR.global.skillCategories.fightingSkills",
  performanceSkills: "CPR.global.skillCategories.performanceSkills",
  rangedweaponSkills: "CPR.global.skillCategories.rangedWeaponSkills",
  socialSkills: "CPR.global.skillCategories.socialSkills",
  techniqueSkills: "CPR.global.skillCategories.techniqueSkills",
};

// Sorted A-Z
CPR.skillList = {
  athletics: "CPR.global.skills.athletics",
  basicTech: "CPR.global.skills.basicTech",
  brawling: "CPR.global.skills.brawling",
  bribery: "CPR.global.skills.bribery",
  concentration: "CPR.global.skills.concentration",
  conversation: "CPR.global.skills.conversation",
  cyberTech: "CPR.global.skills.cybertech",
  education: "CPR.global.skills.education",
  evasion: "CPR.global.skills.evasion",
  firstAid: "CPR.global.skills.firstAid",
  humanPerception: "CPR.global.skills.humanPerception",
  interrogation: "CPR.global.skills.interrogation",
  localExpert: "CPR.global.skills.localExpert",
  meleeWeapon: "CPR.global.skills.meleeWeapon",
  perception: "CPR.global.skills.perception",
  persuasion: "CPR.global.skills.persuasion",
  playInstrument: "CPR.global.skills.playInstrument",
  stealth: "CPR.global.skills.stealth",
  tracking: "CPR.global.skills.tracking",
  accounting: "CPR.global.skills.accounting",
  acting: "CPR.global.skills.acting",
  airVehicleTech: "CPR.global.skills.airVehicleTech",
  animalHandling: "CPR.global.skills.animalHandling",
  archery: "CPR.global.skills.archery",
  autofire: "CPR.global.skills.autofire",
  bureaucracy: "CPR.global.skills.bureaucracy",
  business: "CPR.global.skills.business",
  composition: "CPR.global.skills.composition",
  concealOrRevealObject: "CPR.global.skills.concealOrRevealObject",
  contortionist: "CPR.global.skills.contortionist",
  criminology: "CPR.global.skills.criminology",
  cryptography: "CPR.global.skills.cryptography",
  dance: "CPR.global.skills.dance",
  deduction: "CPR.global.skills.deduction",
  demolitions: "CPR.global.skills.demolitions",
  driveLandVehicle: "CPR.global.skills.driveLandVehicle",
  electronicsAndSecurityTech: "CPR.global.skills.electronicsAndSecurityTech",
  endurance: "CPR.global.skills.endurance",
  forgery: "CPR.global.skills.forgery",
  gamble: "CPR.global.skills.gamble",
  handgun: "CPR.global.skills.handgun",
  heavyWeapons: "CPR.global.skills.heavyWeapons",
  landVehicleTech: "CPR.global.skills.landVehicleTech",
  language: "CPR.global.skills.language",
  librarySearch: "CPR.global.skills.librarySearch",
  lipReading: "CPR.global.skills.lipReading",
  martialArts: "CPR.global.skills.martialArts",
  paintOrDrawOrSculpt: "CPR.global.skills.paintOrDrawOrSculpt",
  paramedic: "CPR.global.skills.paramedic",
  personalGrooming: "CPR.global.skills.personalGrooming",
  photographyAndFilm: "CPR.global.skills.photographyAndFilm",
  pickLock: "CPR.global.skills.pickLock",
  pickPocket: "CPR.global.skills.pickPocket",
  pilotAirVehicle: "CPR.global.skills.pilotAirVehicle",
  pilotSeaVehicle: "CPR.global.skills.pilotSeaVehicle",
  resistTortureOrDrugs: "CPR.global.skills.resistTortureOrDrugs",
  riding: "CPR.global.skills.riding",
  science: "CPR.global.skills.science",
  seaVehicleTech: "CPR.global.skills.seaVehicleTech",
  shoulderArms: "CPR.global.skills.shoulderArms",
  streetWise: "CPR.global.skills.streetwise",
  tactics: "CPR.global.skills.tactics",
  trading: "CPR.global.skills.trading",
  wardrobeAndStyle: "CPR.global.skills.wardrobeAndStyle",
  weaponsTech: "CPR.global.skills.weaponstech",
  wildernessSurvival: "CPR.global.skills.wildernessSurvival",
};

// Unsorted
CPR.skillDifficulties = {
  typical: "CPR.global.skills.difficulty.typical",
  difficult: "CPR.global.skills.difficulty.difficult",
  role: "CPR.global.skills.difficulty.role",
};

// Sorted as listed in core rule book
CPR.weaponTypeList = {
  assaultRifle: "CPR.global.weaponType.assaultRifle",
  bow: "CPR.global.weaponType.bowsAndCrossbows",
  grenadeLauncher: "CPR.global.weaponType.grenadeLauncher",
  heavyMelee: "CPR.global.weaponType.heavyMeleeWeapon",
  heavyPistol: "CPR.global.weaponType.heavyPistol",
  heavySmg: "CPR.global.weaponType.heavySmg",
  lightMelee: "CPR.global.weaponType.lightMeleeWeapon",
  martialArts: "CPR.global.weaponType.martialArts",
  medMelee: "CPR.global.weaponType.mediumMeleeWeapon",
  medPistol: "CPR.global.weaponType.mediumPistol",
  rocketLauncher: "CPR.global.weaponType.rocketLauncher",
  shotgun: "CPR.global.weaponType.shotgun",
  smg: "CPR.global.weaponType.smg",
  sniperRifle: "CPR.global.weaponType.sniperRifle",
  thrownWeapon: "CPR.global.weaponType.thrownWeapon",
  unarmed: "CPR.global.weaponType.unarmed",
  vHeavyMelee: "CPR.global.weaponType.veryHeavyMeleeWeapon",
  vHeavyPistol: "CPR.global.weaponType.veryHeavyPistol",
};

// Sorted as listed in core rule book
CPR.ammoVariety = {
  arrow: "CPR.global.ammo.variety.arrow",
  battery: "CPR.global.ammo.variety.battery",
  grenade: "CPR.global.ammo.variety.grenade",
  heavyPistol: "CPR.global.ammo.variety.heavyPistol",
  medPistol: "CPR.global.ammo.variety.mediumPistol",
  rifle: "CPR.global.ammo.variety.rifle",
  rocket: "CPR.global.ammo.variety.rocket",
  shotgunShell: "CPR.global.ammo.variety.shell",
  shotgunSlug: "CPR.global.ammo.variety.slug",
  vHeavyPistol: "CPR.global.ammo.variety.veryHeavyPistol",
};

// Not sorted
CPR.ammoType = {
  basic: "CPR.global.ammo.type.basic",
  armorPiercing: "CPR.global.ammo.type.armorPiercing",
  biotoxin: "CPR.global.ammo.type.biotoxin",
  emp: "CPR.global.ammo.type.emp",
  expansive: "CPR.global.ammo.type.expansive",
  flashbang: "CPR.global.ammo.type.flashBang",
  incendiary: "CPR.global.ammo.type.incendiary",
  poison: "CPR.global.ammo.type.poison",
  rubber: "CPR.global.ammo.type.rubber",
  sleep: "CPR.global.ammo.type.sleep",
  smart: "CPR.global.ammo.type.smart",
  smoke: "CPR.global.ammo.type.smoke",
  teargas: "CPR.global.ammo.type.tearGas",
};

CPR.inventoryCategories = {
  weapon: "CPR.global.itemTypes.weapon",
  ammo: "CPR.global.itemTypes.ammo",
  armor: "CPR.global.itemTypes.armor",
  cyberware: "CPR.global.itemTypes.cyberware",
  gear: "CPR.global.itemTypes.gear",
  clothing: "CPR.global.itemTypes.clothing",
  vehicle: "CPR.global.itemTypes.vehicle",
  cyberdeck: "CPR.global.itemTypes.cyberdeck",
  program: "CPR.global.itemTypes.program",
  itemUpgrade: "CPR.global.itemTypes.itemUpgrade",
};

CPR.objectTypes = {
  ammo: "CPR.global.itemTypes.ammo",
  armor: "CPR.global.itemTypes.armor",
  clothing: "CPR.global.itemTypes.clothing",
  criticalInjury: "CPR.global.itemTypes.criticalInjury",
  cyberdeck: "CPR.global.itemTypes.cyberdeck",
  cyberware: "CPR.global.itemTypes.cyberware",
  gear: "CPR.global.itemTypes.gear",
  itemUpgrade: "CPR.global.itemTypes.itemUpgrade",
  netarch: "CPR.global.itemTypes.netArchitecture",
  program: "CPR.global.itemTypes.program",
  role: "CPR.global.itemTypes.role",
  skill: "CPR.global.itemTypes.skill",
  vehicle: "CPR.global.itemTypes.vehicle",
  weapon: "CPR.global.itemTypes.weapon",
};

// Sorted A-Z
CPR.clothingStyle = {
  asiaPop: "CPR.global.clothing.style.asiaPop",
  bagLadyChic: "CPR.global.clothing.style.bagLadyChic",
  bohemian: "CPR.global.clothing.style.bohemian",
  businesswear: "CPR.global.clothing.style.businessWear",
  gangColors: "CPR.global.clothing.style.gangColors",
  genericChic: "CPR.global.clothing.style.genericChic",
  highFashion: "CPR.global.clothing.style.highFashion",
  leisurewear: "CPR.global.clothing.style.leisureWear",
  nomadLeathers: "CPR.global.clothing.style.nomadLeathers",
  urbanFlash: "CPR.global.clothing.style.urbanFlash",
};

// Sorted A-Z
CPR.clothingType = {
  bottoms: "CPR.global.clothing.type.bottoms",
  contactLenses: "CPR.global.clothing.type.contactLenses",
  footwear: "CPR.global.clothing.type.footWear",
  glasses: "CPR.global.clothing.type.glasses",
  hats: "CPR.global.clothing.type.hats",
  jacket: "CPR.global.clothing.type.jacket",
  jewelry: "CPR.global.clothing.type.jewelry",
  mirrorshades: "CPR.global.clothing.type.mirrorshades",
  top: "CPR.global.clothing.type.top",
};

//
CPR.cyberwareTypeList = {
  cyberAudioSuite: "CPR.global.cyberwareType.cyberAudioSuite",
  cyberEye: "CPR.global.cyberwareType.cyberEye",
  cyberArm: "CPR.global.cyberwareType.cyberArm",
  cyberLeg: "CPR.global.cyberwareType.cyberLeg",
  neuralWare: "CPR.global.cyberwareType.neuralware",
  cyberwareInternal: "CPR.global.cyberwareType.cyberwareInternal",
  cyberwareExternal: "CPR.global.cyberwareType.cyberwareExternal",
  fashionware: "CPR.global.cyberwareType.fashionware",
  borgware: "CPR.global.cyberwareType.borgware",
};

CPR.cyberwareInstallList = {
  mall: "CPR.global.cyberwareInstall.mall",
  clinic: "CPR.global.cyberwareInstall.clinic",
  hospital: "CPR.global.cyberwareInstall.hospital",
  notApplicable: "CPR.global.generic.notApplicable",
};

CPR.woundState = {
  notWounded: "CPR.global.woundState.notWounded",
  lightlyWounded: "CPR.global.woundState.lightlyWounded",
  seriouslyWounded: "CPR.global.woundState.seriouslyWounded",
  mortallyWounded: "CPR.global.woundState.mortallyWounded",
  dead: "CPR.global.woundState.dead",
};

// Sorted A-Z
CPR.equipped = {
  carried: "CPR.global.equipState.carried",
  equipped: "CPR.global.equipState.equipped",
  owned: "CPR.global.equipState.owned",
};

CPR.itemPriceCategory = {
  cheap: "CPR.global.priceCategory.cheap",
  everyday: "CPR.global.priceCategory.everyday",
  costly: "CPR.global.priceCategory.costly",
  premium: "CPR.global.priceCategory.premium",
  expensive: "CPR.global.priceCategory.expensive",
  veryExpensive: "CPR.global.priceCategory.veryExpensive",
  luxury: "CPR.global.priceCategory.luxury",
  superLuxury: "CPR.global.priceCategory.superLuxury",
};

CPR.itemQuality = {
  poor: "CPR.global.itemQuality.poor",
  standard: "CPR.global.itemQuality.standard",
  excellent: "CPR.global.itemQuality.excellent",
};

CPR.criticalInjuryLocation = {
  body: "CPR.global.location.body",
  head: "CPR.global.location.head",
};

CPR.criticalInjuryQuickFix = {
  firstAidParamedic: "CPR.global.criticalInjury.firstAidOrParamedic",
  paramedic: "CPR.global.skills.paramedic",
  notApplicable: "CPR.global.generic.notApplicable",
};

CPR.criticalInjuryTreatment = {
  paramedicSurgery: "CPR.global.criticalInjury.paramedicOrSurgery",
  quickFix: "CPR.global.criticalInjury.quickfix",
  surgery: "CPR.global.role.medtech.ability.surgery",
};

CPR.aimedLocation = {
  head: "CPR.global.location.head",
  heldItem: "CPR.global.location.heldItem",
  leg: "CPR.global.location.leg",
};

CPR.blackIceType = {
  antipersonnel: "CPR.global.blackIce.type.antiPersonnel",
  antiprogram: "CPR.global.blackIce.type.antiProgram",
  other: "CPR.global.blackIce.type.other",
};

CPR.blackIceStatList = {
  per: "CPR.global.blackIce.stats.per",
  spd: "CPR.global.blackIce.stats.spd",
  atk: "CPR.global.blackIce.stats.atk",
  def: "CPR.global.blackIce.stats.def",
  rez: "CPR.global.generic.rez",
};

CPR.demonStatList = {
  rez: "CPR.global.generic.rez",
  interface: "CPR.global.role.netrunner.ability.interface",
  netactions: "CPR.global.demon.netActions",
  combatNumber: "CPR.global.demon.combatNumber",
};

CPR.programClassList = {
  antipersonnelattacker: "CPR.global.programClass.antiPersonnelAttacker",
  antiprogramattacker: "CPR.global.programClass.antiProgramAttacker",
  booster: "CPR.global.programClass.booster",
  defender: "CPR.global.programClass.defender",
  blackice: "CPR.global.programClass.blackice",
};

CPR.interfaceAbilities = {
  scanner: "CPR.global.role.netrunner.interfaceAbility.scanner",
  backdoor: "CPR.global.role.netrunner.interfaceAbility.backdoor",
  cloak: "CPR.global.role.netrunner.interfaceAbility.cloak",
  control: "CPR.global.role.netrunner.interfaceAbility.control",
  eyedee: "CPR.global.role.netrunner.interfaceAbility.eyedee",
  pathfinder: "CPR.global.role.netrunner.interfaceAbility.pathfinder",
  slide: "CPR.global.role.netrunner.interfaceAbility.slide",
  virus: "CPR.global.role.netrunner.interfaceAbility.virus",
  zap: "CPR.global.role.netrunner.interfaceAbility.zap",
};

CPR.roleSpecialOptions = {
  "--": "CPR.global.generic.notApplicable",
  varying: "CPR.global.generic.varying",
};

CPR.universalBonuses = {
  attack: "CPR.universalBonuses.attack",
  damage: "CPR.universalBonuses.damage",
};

// The following item types have the upgradable template:
//  *ammo, armor, cyberware, cyberdeck, *gear, clothing, weapon, vehicle
CPR.upgradableDataPoints = {
  upgradeConfig: {
    configurableTypes: {
      modifier: "CPR.itemSheet.itemUpgrade.modifier",
      override: "CPR.itemSheet.itemUpgrade.override",
    },
  },
  weapon: {
    damage: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.generic.damage",
    },
    rof: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.weapon.rof",
    },
    attackmod: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.weapon.attackMod",
    },
    magazine: {
      type: "override",
      value: 0,
      localization: "CPR.itemSheet.weapon.magazine",
    },
    secondaryWeapon: {
      type: "item",
      configured: false,
      localization: "CPR.itemSheet.itemUpgrade.isSecondaryWeapon",
    },
  },
  vehicle: {
    sdp: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.vehicle.sdp",
    },
    seats: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.vehicle.seats",
    },
    speedCombat: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.vehicle.combatSpeed",
    },
  },
  cyberware: {
    secondaryWeapon: {
      type: "item",
      configured: false,
      localization: "CPR.itemSheet.itemUpgrade.isSecondaryWeapon",
    },
  },
  cyberdeck: {
    slots: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.generic.slots",
    },
  },
  clothing: {
    "Wardrobe & Style": {
      type: "modifier",
      value: 0,
      localization: "CPR.global.skills.wardrobeAndStyle",
    },
    cool: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.cool",
    },
  },
  armor: {
    bodySp: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.armor.bodyArmorSp",
    },
    headSp: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.armor.headArmorSp",
    },
    shieldHp: {
      type: "modifier",
      value: 0,
      localization: "CPR.itemSheet.itemUpgrade.shieldHp",
    },
  },
  gear: {
    int: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.int",
    },
    ref: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.ref",
    },
    dex: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.dex",
    },
    tech: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.tech",
    },
    cool: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.cool",
    },
    will: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.will",
    },
    luck: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.luck",
    },
    move: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.move",
    },
    body: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.body",
    },
    emp: {
      type: "modifier",
      value: 0,
      localization: "CPR.global.stats.emp",
    },
  },
};

export default CPR;
