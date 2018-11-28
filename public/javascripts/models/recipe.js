class recipe {

  constructor (name, ingredientsID, keywords, description) {
  	this.name = name;
    this.ingredients = ingredientsID;
    this.keywords = keywords;
    this.description = description;
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
      'name': this.name,
      'ingredients': this.ingredients,
      'keywords': this.keywords,
      'description': this.description
    };
  }

}

module.exports = recipe;
