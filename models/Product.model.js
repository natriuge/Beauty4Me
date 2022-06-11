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
  category: { type: String },
  sephoraReviews: [],
  productId_sephora: { type: String },
  preferedSku: { type: String },
  userReviews: [{ type: Types.ObjectId, ref: "Review" }],
  favoritedBy: [{ type: Types.ObjectId, ref: "User" }],
});

// ProductSchema.index({ productName: "text", shortDescription: "text" }); //todos os campos relevantes
// //operador text dentro do find para procurar dentro destes todos citados

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
