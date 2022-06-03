const router = require("express").Router();

const ReviewModel = require("../models/Review.model");
const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");



module.exports = router;