export const CPR = {};

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

CPR.roleList = {
  "netrunner": "CPR.netrunnerrole",
  "solo": "CPR.solorole",
  "fixer": "CPR.fixerrole",
  "nomad": "CPR.nomadrole",
  "media": "CPR.mediarole",
  "exec": "CPR.execrole",
  "lawman": "CPR.lawmanrole",
  "rockerboy": "CPR.rockerboyrole",
  "tech": "CPR.techrole",
  "medtech": "CPR.medtechrole",
}


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

CPR.skillList = {
  "athletics": "CPR.athletics",
  "basicTech": "CPR.basictech",
  "brawling": "CPR.brawling",
  "bribery": "CPR.bribery",
  "concentration": "CPR.concentration",
  "conversation": "CPR.conversation",
  "cyberTech": "CPR.cybertech",
  "driving": "CPR.driving",
  "education": "CPR.education",
  "evasion": "CPR.evasion",
  "firstAid": "CPR.firstaid",
  "humanPerception": "CPR.humanperception",
  "interrogation": "CPR.interrogation",
  "localExpert": "CPR.localexpert",
  "marksmanship": "CPR.marksmanship",
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
CPR.skillDifficulties = {
  "typical": "CPR.skilldifficultytypical",
  "difficult": "CPR.skilldifficultydifficult",
  "role": "CPR.skilldifficultyrole"
}

CPR.weaponTypeList = {
  "lightMelee": "CPR.lightmelee",
  "medMelee": "CPR.medmelee",
  "heavyMelee": "CPR.heavymelee",
  "vHeavyMelee": "CPR.vheavymelee",
  "medPistol": "CPR.mediumpistol",
  "heavyPistol": "CPR.heavypistol",
  "vHeavyPistol": "CPR.vheavypistol",
  "smg": "CPR.smg",
  "heavySmg": "CPR.heavysmg",
  "shotgun": "CPR.shotgun",
  "assualtRifle": "CPR.assualtrifle",
  "sniperRifler": "CPR.sniperrifle",
  "bows": "CPR.bows",
  "grenadeLauncher": "CPR.grenadelauncher",
  "rocketLauncher": "CPR.rocketlauncher"
}

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

CPR.ammoType = {
  "basic": "CPR.ammotypebasic"
}

CPR.roleAbilityList = {
  "operator": "CPR.operator",
  "interface": "CPR.interface",
  "backup": "CPR.backup",
  "moto": "CPR.moto",
  "combatAwareness": "CPR.combatawareness",
  "credibility": "CPR.credibility",
  "teamwork": "CPR.teamwork",
  "charismaticImpact": "CPR.charismaticimpact",
  "medicine": "CPR.medicine",
  "maker": "CPR.maker",
  "fabricationExpertise": "CPR.fabricationexpertise",
  "fieldExpertise": "CPR.fieldexpertise",
  "inventionExpertise": "CPR.inventionexpertise",
  "upgradeExpertise": "CPR.upgradeexpertise",
  "surgery": "CPR.surgery"
}