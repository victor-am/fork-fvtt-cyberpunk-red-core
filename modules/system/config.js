export const CPR = {};

// Sorted as shown on char sheet (with resources pushed to bottom)
CPR.statList = {
  "int": "CPR.int",
  "ref": "CPR.ref",
  "dex": "CPR.dex",
  "tech": "CPR.tech",
  "cool": "CPR.cool",
  "will": "CPR.will",
  "move": "CPR.move",
  "body": "CPR.body",
  "luck": "CPR.luck",
  "emp": "CPR.emp"
}

// Sorted A-Z
CPR.roleList = {
  "exec": "CPR.execrole",
  "fixer": "CPR.fixerrole",
  "lawman": "CPR.lawmanrole",
  "media": "CPR.mediarole",
  "medtech": "CPR.medtechrole",
  "netrunner": "CPR.netrunnerrole",
  "nomad": "CPR.nomadrole",
  "rockerboy": "CPR.rockerboyrole",
  "solo": "CPR.solorole",
  "tech": "CPR.techrole",
}

// Sorted A-Z
CPR.roleAbilityList = {
  "backup": "CPR.backup",
  "charismaticImpact": "CPR.charismaticimpact",
  "combatAwareness": "CPR.combatawareness",
  "credibility": "CPR.credibility",
  "fabricationExpertise": "CPR.fabricationexpertise",
  "fieldExpertise": "CPR.fieldexpertise",
  "operator": "CPR.operator",
  "interface": "CPR.interface",
  "inventionExpertise": "CPR.inventionexpertise",
  "maker": "CPR.maker",
  "medicine": "CPR.medicine",
  "moto": "CPR.moto",
  "surgery": "CPR.surgery",
  "teamwork": "CPR.teamwork",
  "upgradeExpertise": "CPR.upgradeexpertise"
}

// Sorted A-Z
CPR.skillCategories = {
  "awarenessSkills": "CPR.awarenessskills",
  "bodySkills": "CPR.bodyskills",
  "controlSkills": "CPR.controlskills",
  "educationSkills": "CPR.educationskills",
  "fightingSkills": "CPR.fightingskills",
  "performanceSkills": "CPR.performanceskills",
  "rangedweaponSkills": "CPR.rangedweaponskills",
  "socialSkills": "CPR.socialskills",
  "techniqueSkills": "CPR.techniqueskills",
}

// Sorted A-Z
CPR.skillList = {
  "athletics": "CPR.athletics",
  "basicTech": "CPR.basictech",
  "brawling": "CPR.brawling",
  "bribery": "CPR.bribery",
  "concentration": "CPR.concentration",
  "conversation": "CPR.conversation",
  "cyberTech": "CPR.cybertech",
  "education": "CPR.education",
  "evasion": "CPR.evasion",
  "firstAid": "CPR.firstaid",
  "humanPerception": "CPR.humanperception",
  "interrogation": "CPR.interrogation",
  "localExpert": "CPR.localexpert",
  "meleeWeapon": "CPR.meleeweapon",
  "perception": "CPR.perception",
  "persuasion": "CPR.persuasion",
  "playInstrument": "CPR.playinstrument",
  "stealth": "CPR.stealth",
  "tracking": "CPR.tracking",
  "accounting": "CPR.accounting",
  "acting": "CPR.acting",
  "airVehicleTech": "CPR.airvehicletech",
  "animalHandling": "CPR.animalhandling",
  "archery": "CPR.archery",
  "autofire": "CPR.autofire",
  "bureaucracy": "CPR.bureaucracy",
  "business": "CPR.business",
  "composition": "CPR.composition",
  "concealOrRevealObject": "CPR.concealorrevealobject",
  "contortionist": "CPR.contortionist",
  "criminology": "CPR.criminology",
  "cryptography": "CPR.cryptography",
  "dance": "CPR.dance",
  "deduction": "CPR.deduction",
  "demolitions": "CPR.demolitions",
  "driveLandVehicle": "CPR.drivelandvehicle",
  "electronicsAndSecurityTech": "CPR.electronicsandsecuritytech",
  "endurance": "CPR.endurance",
  "forgery": "CPR.forgery",
  "gamble": "CPR.gamble",
  "handgun": "CPR.handgun",
  "heavyWeapons": "CPR.heavyweapons",
  "landVehicleTech": "CPR.landvehicletech",
  "language": "CPR.language",
  "librarySearch": "CPR.librarysearch",
  "lipReading": "CPR.lipreading",
  "martialArts": "CPR.martialarts",
  "paintOrDrawOrSculpt": "CPR.paintordraworsculpt",
  "paramedic": "CPR.paramedic",
  "personalGrooming": "CPR.personalgrooming",
  "photographyAndFilm": "CPR.photographyandfilm",
  "pickLock": "CPR.picklock",
  "pickPocket": "CPR.pickpocket",
  "pilotAirVehicle": "CPR.pilotairvehicle",
  "pilotSeaVehicle": "CPR.pilotseavehicle",
  "resistTortureOrDrugs": "CPR.resisttortureordrugs",
  "riding": "CPR.riding",
  "science": "CPR.science",
  "seaVehicleTech": "CPR.seavehicletech",
  "shoulderArms": "CPR.shoulderarms",
  "streetWise": "CPR.streetwise",
  "tactics": "CPR.tactics",
  "trading": "CPR.trading",
  "wardrobeAndStyle": "CPR.wardrobeandstyle",
  "weaponsTech": "CPR.weaponstech",
  "wildernessSurvival": "CPR.wildernesssurvival"
}

// TODO - Does 'role' need to be listed here? 
// TODO - Discuss how this will be used to count IP.
// Unsorted
CPR.skillDifficulties = {
  "typical": "CPR.skilldifficultytypical",
  "difficult": "CPR.skilldifficultydifficult",
  "role": "CPR.skilldifficultyrole"
}

// Sorted as listed in core rule book
CPR.weaponTypeList = {
  "lightMelee": "CPR.lightmeleeweapon",
  "medMelee": "CPR.mediummeleeweapon",
  "heavyMelee": "CPR.heavymeleeweapon",
  "vHeavyMelee": "CPR.veryheavymeleeweapon",
  "medPistol": "CPR.mediumpistol",
  "heavyPistol": "CPR.heavypistol",
  "vHeavyPistol": "CPR.veryheavypistol",
  "smg": "CPR.smg",
  "heavySmg": "CPR.heavysmg",
  "shotgun": "CPR.shotgun",
  "assualtRifle": "CPR.assaultrifle",
  "sniperRifler": "CPR.sniperrifle",
  "bows": "CPR.bowsandcrossbows",
  "grenadeLauncher": "CPR.grenadelauncher",
  "rocketLauncher": "CPR.rocketlauncher"
}

// Sorted as listed in core rule book
CPR.ammoVariety = {
  "medPistol": "CPR.ammovarmediumpistol",
  "heavyPistol": "CPR.ammovarheavypistol",
  "vHeavyPistol": "CPR.ammovarvheavypistol",
  "shotgunSlug": "CPR.ammovarslug",
  "shotgunShell": "CPR.ammovarshell",
  "rifle": "CPR.ammovarrifle",
  "arrow": "CPR.ammovararrow",
  "grenade": "CPR.ammovargrenade",
  "rocket": "CPR.ammovarrocket"
}

// Not sorted
CPR.ammoType = {
  "basic": "CPR.ammotypebasic"
}

CPR.inventoryCategories = {
  "weapon": "CPR.weapon",
  "ammo": "CPR.ammo",
  "armor": "CPR.armor",
  "drug": "CPR.drug",
  "gear": "CPR.gear"
}
