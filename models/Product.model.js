const { Schema, Types, model } = require("mongoose");

const ProductSchema = new Schema({
  productName: { type: String },
  image240: { type: String },
  image135: { type: String },
  shortDescription: { type: String },
  longDescription: { type: String },
  brandName: { type: String },
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
