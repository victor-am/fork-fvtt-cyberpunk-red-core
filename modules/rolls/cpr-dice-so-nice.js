export default class DiceSoNice {
    Roll3d(roll, user, synchronize = false, whisper = null, blind = false) {
        game.dice3d.showForRoll(roll, user, synchronize, whisper, blind)
    }
}