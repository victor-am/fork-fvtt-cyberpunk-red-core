export async function RollCard(rollResult) {
    
    return renderTemplate("systems/cyberpunk-red-core/templates/chat/cpr-rollcard.hbs", rollResult).then(html => {
        let chatOptions = { content: html};
        return ChatMessage.create(chatOptions, false);
      });
}
