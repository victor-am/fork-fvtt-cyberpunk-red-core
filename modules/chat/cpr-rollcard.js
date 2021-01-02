import CPRConfigUtils from "../utils/cpr-systemUtils.js";
import LOGGER from "../utils/cpr-logger.js";

export async function RollCard(rollResult) {
    LOGGER.trace(`RollCard | Chat | Called.`);
    CPRConfigUtils.AddConfigData(rollResult);
    console.log(rollResult);
    return renderTemplate("systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs", rollResult).then(html => {
        let chatOptions = { content: html };
        return ChatMessage.create(chatOptions, false);
    });
}
