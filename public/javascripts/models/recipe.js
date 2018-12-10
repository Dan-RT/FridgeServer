class recipe {

  constructor (idAPI, name, ingredientsBarcode, keywords, description) {
  	this.name = name;
    this.ingredientsBarcode = ingredientsBarcode;
    this.keywords = keywords;
    this.description = description;
    this.idAPI = idAPI;
  }

  _generateKeywords() {
    let currentObject = this;

    this.ingredients.forEach(function(item) {
      item.keywords.forEach(function (keyword) {
          currentObject.keywords.push(keyword);
      })
    });

  }

  addIngredients(ingredientID) {
    this.ingredients.push(ingredientID);
    //Do Stuffs with keywords
  }

  matchKeyword(word) {
    return this.keywords.includes(word);
  }

  toJSON () {
    return {
      'idAPI': this.idAPI,
      'name': this.name,
      'ingredients': this.ingredients,
      'keywords': this.keywords,
      'description': this.description
    };
  }

}

module.exports = recipe;
