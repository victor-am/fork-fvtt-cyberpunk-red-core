import LOGGER from "../utils/cpr-logger.js";
export default async function registerHandlebarsHelpers() {
    LOGGER.log("Calling Regiser Handlebars Helpers")
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
        return (arg1.toLowerCase() == arg2.toLowerCase()) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("loud", function(string) {
      return string.toUpperCase()
    });

    Handlebars.registerHelper("getProp", (thing, props) => {
      const property = getProperty(thing, props)
      return property 
    });
    
}