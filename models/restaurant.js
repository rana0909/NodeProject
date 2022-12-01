var mongoose = require("mongoose");
var Schema = mongoose.Schema;

GradeSchema = new Schema({
  date: Date,
  grade: String,
  score: Number,
});

AddressSchema = new Schema({
  building: String,
  street: String,
  zipcode: String,
  coord: [Number],
});

RestaurantSchema = new Schema({
  restaurant_id: String,
  name: String,
  grades: [GradeSchema],
  cuisine: String,
  borough: String,
  address: AddressSchema,
});

module.exports = mongoose.model("restaurants", RestaurantSchema);
