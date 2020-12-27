export const CPR = {};


// TODO - VERIFY ALL CONFIG VALUES LINK TO A LOCALIZATION VALUE!!!
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

// Griff - Great job on the localization names man!
CPR.skillCategories = {
  "awarenessskills": "CPR.awarenessskills",
  "bodyskills": "CPR.bodyskills",
  "controlskills": "CPR.controlskills",
  "educationskills": "CPR.educationskills",
  "fightingskills": "CPR.fightingskills",
  "performanceskills": "CPR.performanceskills",
  "rangedweaponskills": "CPR.rangedweaponskills",
  "socialskills": "CPR.socialskills",
  "techniqueskills": "CPR.techniqueskills",
}

CPR.skillList = {
  "athletics": "CPR.athletics",
  "basictech": "CPR.basictech",
  "brawling": "CPR.brawling",
  "bribery": "CPR.bribery",
  "concentration": "CPR.concentration",
  "conversation": "CPR.conversation",
  "cybertech": "CPR.cybertech",
  "driving": "CPR.driving",
  "education": "CPR.education",
  "evasion": "CPR.evasion",
  "firstaid": "CPR.firstaid",
  "humanperception": "CPR.humanperception",
  "interrogation": "CPR.interrogation",
  "localexpert": "CPR.localexpert",
  "marksmanship": "CPR.marksmanship",
  "meleeweapon": "CPR.meleeweapon",
  "perception": "CPR.perception",
  "persuasion": "CPR.persuasion",
  "playinstrument": "CPR.playinstrument",
  "stealth": "CPR.stealth",
  "tracking": "CPR.tracking",
  "accounting": "CPR.accounting",
  "acting": "CPR.acting",
  "airvehicletech": "CPR.airvehicletech",
  "animalhandling": "CPR.animalhandling",
  "archery": "CPR.archery",
  "autofire": "CPR.autofire",
  "bureaucracy": "CPR.bureaucracy",
  "business": "CPR.business",
  "composition": "CPR.composition",
  "concealorrevealobject": "CPR.concealorrevealobject",
  "contortionist": "CPR.contortionist",
  "criminology": "CPR.criminology",
  "cryptography": "CPR.cryptography",
  "dance": "CPR.dance",
  "deduction": "CPR.deduction",
  "demolitions": "CPR.demolitions",
  "drivelandvehicle": "CPR.drivelandvehicle",
  "electronicsandsecuritytech": "CPR.electronicsandsecuritytech",
  "endurance": "CPR.endurance",
  "forgery": "CPR.forgery",
  "gamble": "CPR.gamble",
  "handgun": "CPR.handgun",
  "heavyweapons": "CPR.heavyweapons",
  "landvehicletech": "CPR.landvehicletech",
  "language": "CPR.language",
  "librarysearch": "CPR.librarysearch",
  "lipreading": "CPR.lipreading",
  "martialarts": "CPR.martialarts",
  "paintordraworsculpt": "CPR.paintordraworsculpt",
  "paramedic": "CPR.paramedic",
  "personalgrooming": "CPR.personalgrooming",
  "photographyandfilm": "CPR.photographyandfilm",
  "picklock": "CPR.picklock",
  "pickpocket": "CPR.pickpocket",
  "pilotairvehicle": "CPR.pilotairvehicle",
  "pilotseavehicle": "CPR.pilotseavehicle",
  "resisttortureordrugs": "CPR.resisttortureordrugs",
  "riding": "CPR.riding",
  "science": "CPR.science",
  "seavehicletech": "CPR.seavehicletech",
  "shoulderarms": "CPR.shoulderarms",
  "streetwise": "CPR.streetwise",
  "tactics": "CPR.tactics",
  "trading": "CPR.trading",
  "wardrobeandstyle": "CPR.wardrobeandstyle",
  "weaponstech": "CPR.weaponstech",
  "wildernesssurvival": "CPR.wildernesssurvival"
}

// ???? TODO -- Does this accomplish what we want for skill training cost? ????
// Switch based on skill difficulty?
// If role skill? Don't allow IP improvement??
// Needs discussed...
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
  "heavysmg": "CPR.heavysmg",
  "shotgun": "CPR.shotgun",
  "assualtRifle": "CPR.assualtrifle",
  "sniperRifler": "CPR.sniperrifle",
  "bows": "CPR.bows",
  "grenadelauncher": "CPR.grenadelauncher",
  "rocketlauncher": "CPR.rocketlauncher"
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
  "combatawareness": "CPR.combatawareness",
  "credibility": "CPR.credibility",
  "teamwork": "CPR.teamwork",
  "charismaticimpact": "CPR.charismaticimpact",
  "medicine": "CPR.medicine",
  "maker": "CPR.maker",
  "fabricationexpertise": "CPR.fabricationexpertise",
  "fieldexpertise": "CPR.fieldexpertise",
  "inventionexpertise": "CPR.inventionexpertise",
  "upgradeexpertise": "CPR.upgradeexpertise",
  "surgery": "CPR.surgery"
}