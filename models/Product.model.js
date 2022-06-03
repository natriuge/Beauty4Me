const { Schema, Types, model } = require("mongoose");

const ProductSchema = new Schema({
  productName: { type: String },
  imageDetails: { type: String },
  imageIcon: { type: String },
  shortDescription: { type: String },
  longDescription: { type: String },
  brandName: { type: String },
  howToUse: { type: String },
  ingredients: { type: String },
  rating: { type: Number },
  averagePrice: { type: Number },
  productSkinType: [{ type: String }],
  category: [{ type: String }],
  reviews: [{ type: Types.ObjectId, ref: "Review" }],
  favoritedBy: [{ type: Types.ObjectId, ref: "User" }],
});

//teste

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
