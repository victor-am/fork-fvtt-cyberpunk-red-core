/* global game */
/* eslint no-fallthrough: ["warn"] */
export default class DiceSoNice {
  static async ShowDiceSoNice(roll, rollModeOverride) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      let whisper = null;
      let blind = false;
      const rollMode = rollModeOverride || game.settings.get("core", "rollMode");
      switch (rollMode) {
        case "blindroll": { // GM only
          blind = true;
        }
        case "gmroll": { // GM + rolling player
          const gmList = game.users.filter((user) => user.isGM);
          const gmIDList = [];
          gmList.forEach((gm) => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        }
        case "selfroll": {
          whisper = [game.user.id];
          break;
        }
        case "roll": { // everybody
          const userList = game.users.filter((user) => user.active);
          const userIDList = [];
          userList.forEach((user) => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
        }
        default:
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }
}
