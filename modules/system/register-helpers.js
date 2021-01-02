import LOGGER from "../utils/cpr-logger.js";
export default function registerHandlebarsHelpers() {
  LOGGER.log("Calling Register Handlebars Helpers")

  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    // LOGGER.trace(`Calling ifEquals Helper | Arg1:${arg1} Arg2:${arg2}`);
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("loud", function (string) {
    // LOGGER.trace(`Calling loud Helper | Arg1:${string}`);
    return string.toUpperCase()
  });

  Handlebars.registerHelper("getProp", (object, property) => {
    // LOGGER.trace(`Calling getProp Helper | Arg1:${object} Arg2:${property}`);
    return getProperty(object, property);
  });

  Handlebars.registerHelper("add", (x, y) => {
    // LOGGER.trace(`Calling add Helper | Arg1:${x} Arg2:${y}`);
    return parseInt(x) + parseInt(y);
  });

}