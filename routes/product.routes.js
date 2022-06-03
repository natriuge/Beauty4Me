const router = require("express").Router();

const ProductModel = require("../models/Product.model");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model");

// Rota de produtos favoritos
router.post("/product", isAuthenticated, async (req, res) => {
  try {
    // Extraindo o id do usuário logado
    const { _id } = req.user;
    const result = await Product.create({ ...req.body, ownerId: _id });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

// GET 
router.get("/room", isAuthenticated, async (req, res) => {
  try {
    const result = await Room.find();

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

router.get("/room/:_id", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.params;

    const result = await Room.findOne({ _id })
      .populate("reviews") // carregar todos os objetos de review no lugar de somente os ids
      .populate("ownerId", "-passwordHash"); // carregar todos os dados de usuário no lugar de somente o id, porém não enviar a senha

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

router.patch("/room/:_id", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.params;

    const result = await Room.findOneAndUpdate(
      { _id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

router.delete("/room/:_id", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.params;

    // Deleta a acomodação
    const result = await Room.findOneAndDelete({ _id }, { new: true });

    // Deleta todos os reviews dessa acomodação
    await Review.deleteMany({ roomId: _id });

    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

module.exports = router;
