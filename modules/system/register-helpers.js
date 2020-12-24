import LOGGER from "../utils/cpr-logger.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Regiser Handlebars Helpers")

  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("loud", function (string) {
    LOGGER.trace(`Calling loud Helper | Arg1:${arg1}`);
    return string.toUpperCase()
  });

  Handlebars.registerHelper("getProp", (arg1, arg2) => {
    LOGGER.trace(`Calling getProp Helper | Arg1:${arg1} Arg2:${arg2}`);
    const prop = getProperty(arg1, arg2);
    return prop;
  });

}