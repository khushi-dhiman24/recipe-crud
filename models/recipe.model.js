const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  title: String, 
  description: String,
  ingredients: Array,
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category"
},
  date:{ type:Date, default: Date.now},
  image:String
});

module.exports = mongoose.model('Recipe', recipeSchema);

