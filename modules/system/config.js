const CPR = {};

// Sorted as shown on char sheet (with resources pushed to bottom)
CPR.statList = {
  int: "CPR.int",
  ref: "CPR.ref",
  dex: "CPR.dex",
  tech: "CPR.tech",
  cool: "CPR.cool",
  will: "CPR.will",
  move: "CPR.move",
  body: "CPR.body",
  luck: "CPR.luck",
  emp: "CPR.emp",
};

// Sorted A-Z
CPR.roleList = {
  exec: "CPR.execrole",
  fixer: "CPR.fixerrole",
  lawman: "CPR.lawmanrole",
  media: "CPR.mediarole",
  medtech: "CPR.medtechrole",
  netrunner: "CPR.netrunnerrole",
  nomad: "CPR.nomadrole",
  rockerboy: "CPR.rockerboyrole",
  solo: "CPR.solorole",
  tech: "CPR.techrole",
};

// Sorted A-Z
CPR.roleAbilityList = {
  backup: "CPR.backup",
  charismaticImpact: "CPR.charismaticimpact",
  combatAwareness: "CPR.combatawareness",
  credibility: "CPR.credibility",
  damageDeflection: "CPR.damagedeflection",
  fabricationExpertise: "CPR.fabricationexpertise",
  fieldExpertise: "CPR.fieldexpertise",
  fumbleRecovery: "CPR.fumblerecovery",
  initiativeReaction: "CPR.initiativereaction",
  interface: "CPR.interface",
  inventionExpertise: "CPR.inventionexpertise",
  maker: "CPR.maker",
  medicine: "CPR.medicine",
  medtechCryo: "CPR.medtechcryo",
  medtechPharma: "CPR.medtechpharma",
  moto: "CPR.moto",
  operator: "CPR.operator",
  precisionAttack: "CPR.precisionattack",
  spotWeakness: "CPR.spotweakness",
  surgery: "CPR.surgery",
  teamwork: "CPR.teamwork",
  threatDetection: "CPR.threatdetection",
  upgradeExpertise: "CPR.upgradeexpertise",
};

// Sorted A-Z
CPR.skillCategories = {
  awarenessSkills: "CPR.awarenessskills",
  bodySkills: "CPR.bodyskills",
  controlSkills: "CPR.controlskills",
  educationSkills: "CPR.educationskills",
  fightingSkills: "CPR.fightingskills",
  performanceSkills: "CPR.performanceskills",
  rangedweaponSkills: "CPR.rangedweaponskills",
  socialSkills: "CPR.socialskills",
  techniqueSkills: "CPR.techniqueskills",
};

// Sorted A-Z
CPR.skillList = {
  athletics: "CPR.athletics",
  basicTech: "CPR.basictech",
  brawling: "CPR.brawling",
  bribery: "CPR.bribery",
  concentration: "CPR.concentration",
  conversation: "CPR.conversation",
  cyberTech: "CPR.cybertech",
  education: "CPR.education",
  evasion: "CPR.evasion",
  firstAid: "CPR.firstaid",
  humanPerception: "CPR.humanperception",
  interrogation: "CPR.interrogation",
  localExpert: "CPR.localexpert",
  meleeWeapon: "CPR.meleeweapon",
  perception: "CPR.perception",
  persuasion: "CPR.persuasion",
  playInstrument: "CPR.playinstrument",
  stealth: "CPR.stealth",
  tracking: "CPR.tracking",
  accounting: "CPR.accounting",
  acting: "CPR.acting",
  airVehicleTech: "CPR.airvehicletech",
  animalHandling: "CPR.animalhandling",
  archery: "CPR.archery",
  autofire: "CPR.autofire",
  bureaucracy: "CPR.bureaucracy",
  business: "CPR.business",
  composition: "CPR.composition",
  concealOrRevealObject: "CPR.concealorrevealobject",
  contortionist: "CPR.contortionist",
  criminology: "CPR.criminology",
  cryptography: "CPR.cryptography",
  dance: "CPR.dance",
  deduction: "CPR.deduction",
  demolitions: "CPR.demolitions",
  driveLandVehicle: "CPR.drivelandvehicle",
  electronicsAndSecurityTech: "CPR.electronicsandsecuritytech",
  endurance: "CPR.endurance",
  forgery: "CPR.forgery",
  gamble: "CPR.gamble",
  handgun: "CPR.handgun",
  heavyWeapons: "CPR.heavyweapons",
  landVehicleTech: "CPR.landvehicletech",
  language: "CPR.language",
  librarySearch: "CPR.librarysearch",
  lipReading: "CPR.lipreading",
  martialArts: "CPR.martialarts",
  paintOrDrawOrSculpt: "CPR.paintordraworsculpt",
  paramedic: "CPR.paramedic",
  personalGrooming: "CPR.personalgrooming",
  photographyAndFilm: "CPR.photographyandfilm",
  pickLock: "CPR.picklock",
  pickPocket: "CPR.pickpocket",
  pilotAirVehicle: "CPR.pilotairvehicle",
  pilotSeaVehicle: "CPR.pilotseavehicle",
  resistTortureOrDrugs: "CPR.resisttortureordrugs",
  riding: "CPR.riding",
  science: "CPR.science",
  seaVehicleTech: "CPR.seavehicletech",
  shoulderArms: "CPR.shoulderarms",
  streetWise: "CPR.streetwise",
  tactics: "CPR.tactics",
  trading: "CPR.trading",
  wardrobeAndStyle: "CPR.wardrobeandstyle",
  weaponsTech: "CPR.weaponstech",
  wildernessSurvival: "CPR.wildernesssurvival",
};

// TODO - Does 'role' need to be listed here?
// TODO - Discuss how this will be used to count IP.
// Unsorted
CPR.skillDifficulties = {
  typical: "CPR.skilldifficultytypical",
  difficult: "CPR.skilldifficultydifficult",
  role: "CPR.skilldifficultyrole",
};

// Sorted as listed in core rule book
CPR.weaponTypeList = {
  assaultRifle: "CPR.assaultrifle",
  bow: "CPR.bowsandcrossbows",
  grenadeLauncher: "CPR.grenadelauncher",
  heavyMelee: "CPR.heavymeleeweapon",
  heavyPistol: "CPR.heavypistol",
  heavySmg: "CPR.heavysmg",
  lightMelee: "CPR.lightmeleeweapon",
  medMelee: "CPR.mediummeleeweapon",
  medPistol: "CPR.mediumpistol",
  rocketLauncher: "CPR.rocketlauncher",
  shotgun: "CPR.shotgun",
  smg: "CPR.smg",
  sniperRifle: "CPR.sniperrifle",
  thrownWeapon: "CPR.thrownweapon",
  unarmed: "CPR.unarmed",
  vHeavyMelee: "CPR.veryheavymeleeweapon",
  vHeavyPistol: "CPR.veryheavypistol",
};

// Sorted as listed in core rule book
CPR.ammoVariety = {
  arrow: "CPR.ammovararrow",
  battery: "CPR.ammovarbattery",
  grenade: "CPR.ammovargrenade",
  heavyPistol: "CPR.ammovarheavypistol",
  medPistol: "CPR.ammovarmediumpistol",
  rifle: "CPR.ammovarrifle",
  rocket: "CPR.ammovarrocket",
  shotgunShell: "CPR.ammovarshell",
  shotgunSlug: "CPR.ammovarslug",
  vHeavyPistol: "CPR.ammovarvheavypistol",
};

// Not sorted
CPR.ammoType = {
  basic: "CPR.ammotypebasic",
  armorPiercing: "CPR.ammotypearmorpiercing",
  biotoxin: "CPR.ammotypebiotoxin",
  emp: "CPR.ammotypeemp",
  expansive: "CPR.ammotypeexpansive",
  flashbang: "CPR.ammotypeflashbang",
  incendiary: "CPR.ammotypeincendiary",
  poison: "CPR.ammotypepoison",
  rubber: "CPR.ammotyperubber",
  sleep: "CPR.ammotypesleep",
  smart: "CPR.ammotypesmart",
  smoke: "CPR.ammotypesmoke",
  teargas: "CPR.ammotypeteargas",
};

CPR.inventoryCategories = {
  weapon: "CPR.weapon",
  ammo: "CPR.ammo",
  armor: "CPR.armor",
  cyberware: "CPR.cyberware",
  gear: "CPR.gear",
  clothing: "CPR.clothing",
  vehicle: "CPR.vehicle",
  cyberdeck: "CPR.cyberdeck",
  program: "CPR.programs",
};

CPR.objectTypes = {
  ammo: "CPR.ammo",
  armor: "CPR.armor",
  clothing: "CPR.clothing",
  criticalInjury: "CPR.criticalinjury",
  cyberware: "CPR.cyberware",
  gear: "CPR.gear",
  netarch: "CPR.netarch",
  program: "CPR.program",
  skill: "CPR.skill",
  vehicle: "CPR.vehicle",
  weapon: "CPR.weapon",
};

// Sorted A-Z
CPR.clothingStyle = {
  asiaPop: "CPR.asiapop",
  bagLadyChic: "CPR.bagladychic",
  bohemian: "CPR.bohemian",
  businesswear: "CPR.businesswear",
  gangColors: "CPR.gangcolors",
  genericChic: "CPR.genericchic",
  highFashion: "CPR.highfashion",
  leisurewear: "CPR.leisurewear",
  nomadLeathers: "CPR.nomadleathers",
  urbanFlash: "CPR.urbanflash",
};

// Sorted A-Z
CPR.clothingType = {
  bottoms: "CPR.bottoms",
  contactLenses: "CPR.contactlenses",
  footwear: "CPR.footwear",
  glasses: "CPR.glasses",
  hats: "CPR.hats",
  jacket: "CPR.jacket",
  jewelry: "CPR.jewelry",
  mirrorshades: "CPR.mirrorshades",
  top: "CPR.top",
};

//
CPR.cyberwareTypeList = {
  cyberAudioSuite: "CPR.cyberaudiosuite",
  cyberEye: "CPR.cybereye",
  cyberArm: "CPR.cyberarm",
  cyberLeg: "CPR.cyberleg",
  neuralWare: "CPR.neuralware",
  cyberwareInternal: "CPR.cyberwareinternal",
  cyberwareExternal: "CPR.cyberwareexternal",
  fashionware: "CPR.fashionware",
  borgware: "CPR.borgware",
};

CPR.cyberwareInstallList = {
  mall: "CPR.mall",
  clinic: "CPR.clinic",
  hospital: "CPR.hospital",
  notApplicable: "CPR.notapplicable",
};

CPR.woundState = {
  notWounded: "CPR.notwounded",
  lightlyWounded: "CPR.lightlywounded",
  seriouslyWounded: "CPR.seriouslywounded",
  mortallyWounded: "CPR.mortallywounded",
  dead: "CPR.dead",
};

// Sorted A-Z
CPR.equipped = {
  carried: "CPR.carried",
  equipped: "CPR.equipped",
  owned: "CPR.owned",
};

CPR.itemPriceCategory = {
  cheap: "CPR.pricecategorycheap",
  everyday: "CPR.pricecategoryeveryday",
  costly: "CPR.pricecategorycostly",
  premium: "CPR.pricecategorypremium",
  expensive: "CPR.pricecategoryexpensive",
  veryExpensive: "CPR.pricecategoryveryexpensive",
  luxury: "CPR.pricecategoryluxury",
  superLuxury: "CPR.pricecategorysuperluxury",
};

CPR.itemQuality = {
  poor: "CPR.poor",
  standard: "CPR.standard",
  excellent: "CPR.excellent",
};

CPR.criticalInjuryLocation = {
  body: "CPR.bodylocation",
  head: "CPR.head",
};

CPR.criticalInjuryQuickFix = {
  firstAidParamedic: "CPR.firstaidparamedic",
  paramedic: "CPR.paramedic",
  notApplicable: "CPR.notapplicable",
};

CPR.criticalInjuryTreatment = {
  paramedicSurgery: "CPR.paramedicsurgery",
  quickFix: "CPR.quickfix",
  surgery: "CPR.surgery",
};

CPR.aimedLocation = {
  head: "CPR.head",
  heldItem: "CPR.helditem",
  leg: "CPR.leg",
};

CPR.blackIceType = {
  antipersonnel: "CPR.antipersonnel",
  antiprogram: "CPR.antiprogram",
  other: "CPR.other",
};

CPR.blackIceStatList = {
  per: "CPR.per",
  spd: "CPR.spd",
  atk: "CPR.atk",
  def: "CPR.def",
  rez: "CPR.rez",
};

CPR.demonStatList = {
  rez: "CPR.rez",
  interface: "CPR.interface",
  netactions: "CPR.netactions",
  combatNumber: "CPR.combatnumber",
};

CPR.programClassList = {
  antipersonnelattacker: "CPR.antipersonnelattacker",
  antiprogramattacker: "CPR.antiprogramattacker",
  booster: "CPR.booster",
  defender: "CPR.defender",
  blackice: "CPR.blackice",
};

CPR.interfaceAbilities = {
  scanner: "CPR.scanner",
  backdoor: "CPR.backdoor",
  cloak: "CPR.cloak",
  control: "CPR.control",
  eyedee: "CPR.eyedee",
  pathfinder: "CPR.pathfinder",
  slide: "CPR.slide",
  virus: "CPR.virus",
};

CPR.roleSpecialOptions = {
  "--": "CPR.na",
  varying: "CPR.varying",
}

export default CPR;
