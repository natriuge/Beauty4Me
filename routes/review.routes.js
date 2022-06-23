const router = require("express").Router();
const ReviewModel = require("../models/Review.model");
const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

// //rota get ALL reviews from a single product
router.get("/review", async (req, res) => {
  try {
    let { id } = req.query;
    // get review from a specific product
    const result = await ReviewModel.find({
      productId: ObjectId(id),
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

//rota de criar uma review (post)
router.post("/review", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { _id } = req.user;
    const { productId } = req.body;
    const result = await ReviewModel.create({
      ...req.body,
      authorId: ObjectId(_id),
    });
    console.log(result);
    // Adicionar referência do review criado no modelo da acomodação
    await ProductModel.updateOne(
      { _id: ObjectId(productId) },
      { $push: { allUserReviews: result._id } }
    ); // Como não precisamos incluir na resposta o resultado dessa consulta, podemos usar o updateOne que tem a sintaxe mais simples do que o findOneAndUpdate
    // Adicionar referência do review criado no modelo do usuário
    await UserModel.updateOne(
      { _id },
      { $push: { allUserReviews: result._id } }
    );
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});
//rota de atualizar uma review (patch)
router.patch(
  "/review/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const reviewId = req.params._id;
      // Verifica se a review que vai ser atualizada é de propriedade do usuário logado
      const review = await ReviewModel.findOne({
        _id: reviewId,
        authorId: userId,
      });
      // Usuários somente podem atualizar um review de própria autoria
      if (review) {
        const result = await ReviewModel.findOneAndUpdate(
          { _id: reviewId },
          {
            $set: {
              comment: req.body.comment,
              authorRating: req.body.authorRating,
            },
          },
          { new: true, runValidators: true }
        );
        //não preciso dar push no usermodel e productmodel pois é EDIÇÃO!
        return res.status(201).json(result);
      } else {
        // 400: Bad Request
        return res.status(400).json({ msg: "You cannot update this review" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  }
);
// rota de deletar uma review (delete)
router.delete(
  "/review/:_id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const reviewId = req.params._id;
      // Verifica se a review que vai ser deletada é de propriedade do usuário logado
      const review = await ReviewModel.findOne({
        _id: ObjectId(reviewId),
        authorId: ObjectId(userId),
      });
      console.log(review);
      // Usuários somente podem deletar um review de própria autoria
      if (review) {
        const result = await ReviewModel.findOneAndDelete({
          _id: ObjectId(reviewId),
        });
        // Deletar a referência do review criado no modelo da acomodação
        await ProductModel.updateOne(
          { _id: result.productId },
          { $pull: { allUserReviews: ObjectId(reviewId) } }
        );
        // Deletar a referência do review criado no modelo do usuário
        await UserModel.updateOne(
          { _id: ObjectId(userId) },
          { $pull: { allUserReviews: ObjectId(reviewId) } }
        );
        return res.status(201).json(result);
      } else {
        // 400: Bad Request
        return res.status(400).json({ msg: "You cannot delete this review" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  }
);

module.exports = router;
