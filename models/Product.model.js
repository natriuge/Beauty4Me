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
  averagePrice: { type: String },
  productSkinType: { type: String },
  category: { type: String },
  sephoraReviews: [],
  productId_sephora: { type: String },
  preferedSku: { type: String },
  allProductReviews: [{ type: Types.ObjectId, ref: "Review" }],
  favoritedBy: [{ type: Types.ObjectId, ref: "User" }],
});
const ProductModel = model("Product", ProductSchema);
module.exports = ProductModel;
