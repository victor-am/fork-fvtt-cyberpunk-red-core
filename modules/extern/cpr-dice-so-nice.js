export default class DiceSoNice {
  static async ShowDiceSoNice(roll, rollMode = "roll", options = {}) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      let whisper = null;
      let blind = false;
      switch (rollMode) {
        case "blindroll": //GM only
          blind = true;
        case "gmroll": //GM + rolling player
          let gmList = game.users.filter(user => user.isGM);
          let gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        case "roll": //everybody
          let userList = game.users.filter(user => user.active);
          let userIDList = [];
          userList.forEach(user => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }
}