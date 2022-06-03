const { Schema, Types, model } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },
  skinType: { type: String },
  favoriteProducts: [{ type: Types.ObjectId, ref: "Product" }],
  reviews: [{ type: Types.ObjectId, ref: "Review" }],
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
