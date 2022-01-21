import LOGGER from "../../utils/cpr-logger.js";

/**
 * Valuable Items have a price and a price category. This might belong in "common" if we agree
 * every item in the game should have a price.
 */
const Valuable = function Valuable() {
  /**
   * Return the price of an Item that is set with the category.
   * This is not used anywhere, but will be useful for future automation that sets the category
   * automatically based on the price.
   *
   * @param {String} category - the price category for an Item
   * @returns {Number} - the price of the item per the core rules
   */
  this.calcPrice = function calcPrice(category) {
    LOGGER.trace("calcPrice | Valuable | Called.");
    // Note: since we use "const", this map is not persisted on the Item object the mixin is added to
    const PRICE_CATEGORY_MAPPINGS = {
      free: 0,
      cheap: 5,
      everyday: 20,
      costly: 50,
      premium: 100,
      expensive: 500,
      veryExpensive: 1000,
      luxury: 5000,
      superLuxury: 10000,
    };

    let price = PRICE_CATEGORY_MAPPINGS[category];
    const itemData = this.data;
    if (itemData.type === "ammo") {
      if (itemData.variety !== "grenade" && itemData.variety !== "rocket") price /= 10;
    }
    return price;
  };
};

export default Valuable;
