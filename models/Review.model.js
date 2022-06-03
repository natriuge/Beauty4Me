const { Schema, Types, model } = require("mongoose");

const ReviewSchema = new Schema({
  authorId: { type: Types.ObjectId, ref: "User" },
  comment: { type: String, maxlength: 200 },
  userSkinType: {
    type: String,
    enum: ["Normal", "Dry", "Oily", "Combination"],
  },
  authorRating: { type: Number },
  productId: { type: Types.ObjectId, ref: "Product" },
});

const ReviewModel = model("Review", ReviewSchema);

module.exports = ReviewModel;
