const { Schema, Types, model } = require("mongoose");

const ProductSchema = new Schema({
  productName: { type: String }, //vai ser esse
  imageDetails: { type: String },
  imageIcon: { type: String },
  shortDescription: { type: String }, //esse
  longDescription: { type: String }, //esse
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
ProductSchema.index({ productName: "text", shortDescription: "text", longDescription: "text" });

const ProductModel = model("Product", ProductSchema);

module.exports = ProductModel;
