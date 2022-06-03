const { Schema, Types, model } = require("mongoose");

const ProductSchema = new Schema({
  name: { type: String },
  imageUrl: { type: String },
  shortDescription: { type: String },
  longDescription: { type: String },
  brand: { type: String },
  howToUse: { type: String },
  ingredients: { type: String },
  rating: { type: Number },
  averagePrice: { type: Number },
  highlights: [{ type: Boolean }],
  reviews: [{ type: Types.ObjectId, ref: "Review" }],
  favoritedBy: [{ type: Types.ObjectId, ref: "User" }]

});

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
