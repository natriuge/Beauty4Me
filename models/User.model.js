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
  userSkinType: {
    type: String,
    enum: ["Normal", "Dry", "Oily", "Combination"],
  },
  favoriteProducts: [{ type: Types.ObjectId, ref: "Product" }],
  allUserReviews: [{ type: Types.ObjectId, ref: "Review" }],
  profilePictureUrl: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
  },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
