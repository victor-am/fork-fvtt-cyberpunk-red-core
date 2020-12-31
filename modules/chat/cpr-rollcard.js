import LOGGER from "../utils/cpr-logger.js";

export async function RollCard(rollTitle, rollResult) {
    LOGGER.trace(`RollCard | Chat | Called.`);
    return renderTemplate("systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs", rollResult).then(html => {
        let chatOptions = { content: html };
        return ChatMessage.create(chatOptions, false);
    });
}
