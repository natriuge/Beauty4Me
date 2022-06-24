const { Schema, Types, model } = require("mongoose");

const ReviewSchema = new Schema({
  
  authorName: { type: String },
  authorId: { type: Types.ObjectId, ref: "User" },
  comment: { type: String, maxlength: 400 },
  authorRating: { type: Number },
  productId: { type: Types.ObjectId, ref: "Product" },
});

const ReviewModel = model("Review", ReviewSchema);

module.exports = ReviewModel;
