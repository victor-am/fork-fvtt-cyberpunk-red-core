import LOGGER from "../utils/cpr-logger.js";
export default async function registerHandlebarsHelpers() {
    LOGGER.log("Calling Regiser Handlebars Helpers")
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        LOGGER.trace("Calling ifEquals Helper")
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
}