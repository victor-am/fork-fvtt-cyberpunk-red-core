import LOGGER from "../utils/cpr-logger.js";

export class CPRChat {
    /**
    * Helper function to set up chat data (set roll mode and content).
    * 
    * @param {String} content 
    * @param {String} modeOverride 
    * @param {Boolean} isRoll 
    */
    static ChatDataSetup(content, modeOverride, isRoll = false, forceWhisper) {
        let chatData = {
            user: game.user._id,
            rollMode: modeOverride || game.settings.get("core", "rollMode"),
            content: content
        };

        if (isRoll) {
            chatData.sound = CONFIG.sounds.dice
        }

        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
        }

        if (chatData.rollMode === "blindroll") {
            chatData["blind"] = true;
        } else if (chatData.rollMode === "selfroll") {
            chatData["whisper"] = [game.user];
        }

        if (forceWhisper) {
            chatData["speaker"] = ChatMessage.getSpeaker();
            chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
        }

        return chatData;
    }

    static RenderRollCard(rollResult) {
        LOGGER.trace(`RenderRollCard | Chat | Called.`);
        return renderTemplate("systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs", rollResult).then(html => {
            let chatOptions = this.ChatDataSetup(html);
            return ChatMessage.create(chatOptions, false);
        });
    }
}


