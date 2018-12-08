//const Pointage = require('./pointage.js');

class ingredient {
  constructor (name, typeDish, typeMeal, weight, quantity, keywords, barCode?: string="000000") {
    this.name = name;
    this.typeDish = typeDish;   // entrée/plats/desserts
    this.typeMeal = typeMeal;   // breakfast/lunch/dinner
    this.weight = weight;       // grammes
    this.quantity = quantity;
    this.keywords = keywords;
    this.barCode = barCode
  }

  getKeywords () {
    return this.keywords;
  }

  toString() {
    return  'name' + this.name +
            'typeDish' +  this.typeDish +
            'typeMeal' + this.typeMeal +
            'weight' + this.weight +
            'quantity' + this.quantity +
            'keywords' + this.keywords + 
            'barCode' + this.barCode + 
  }

  toJSON () {
    return {
      'name': this.name,
      'typeDish': this.typeDish,
      'typeMeal': this.typeMeal,
      'weight': this.weight,
      'quantity': this.quantity,
      'keywords': this.keywords, 
      'barCode': this.barCode, 
    };
  }
}

module.exports = ingredient;

