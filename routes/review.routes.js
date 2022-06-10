const router = require("express").Router();

const ReviewModel = require("../models/Review.model");
const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

// //rota get ALL reviews
router.get("/review", async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = Number(page) || 0;
    limit = Number(limit) || 15;

    const result = await ReviewModel.find()
      .skip(page * limit)
      .limit(limit);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

// // get das reviews da api sephora?

//rota de criar uma review (post)
router.post("/review", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const { _id } = req.user;

    const { productId } = req.body;

    const result = await ReviewModel.create({ ...req.body, authorId: _id });

    // Adicionar referência do review criado no modelo da acomodação

    await ProductModel.updateOne(
      { _id: productId },
      { $push: { allProductReviews: result._id } }
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

router.patch("/review", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.user;

    const { productId } = req.body;

    const { authorId } = req.body;

    // Verifica se a review que vai ser atualizada é de propriedade do usuário logado
    const user = await UserModel.findOne({
      _id,
      allUserReviews: { $in: [authorId] },
    });

    console.log(user);

    // Usuários não podem atualizar um review de própria autoria
    if (user) {
      const result = await ReviewModel.findOneAndUpdate(
        { _id, authorId: req.user._id },
        { $set: data },
        { new: true, runValidators: true }
      );

      // Adicionar referência do review criado no modelo da acomodação

      await ProductModel.updateOne(
        { _id: productId },
        { $push: { allProductReviews: result._id } }
      ); // Como não precisamos incluir na resposta o resultado dessa consulta, podemos usar o updateOne que tem a sintaxe mais simples do que o findOneAndUpdate

      // Adicionar referência do review criado no modelo do usuário

      await UserModel.updateOne(
        { _id },
        { $push: { allUserReviews: result._id } }
      );

      return res.status(201).json(result);

router.patch(
  "/review",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const reviewId = req.body._id;

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

    // 400: Bad Request
    return res.status(400).json({ msg: "You cannot update this review" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

// rota de deletar uma review (delete)
router.delete(
  "/review",
  isAuthenticated,
  attachCurrentUser,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const reviewId = req.body._id;

      // Verifica se a review que vai ser deletada é de propriedade do usuário logado
      const review = await ReviewModel.findOne({
        _id: reviewId,
        authorId: userId,
      });

      // Usuários somente podem deletar um review de própria autoria
      if (review) {
        const result = await ReviewModel.findOneAndDelete({ _id: reviewId });

        // Deletar a referência do review criado no modelo da acomodação
        await ProductModel.updateOne(
          { _id: result.productId },
          { $pull: { allProductReviews: reviewId } }
        );

        // Deletar a referência do review criado no modelo do usuário
        await UserModel.updateOne(
          { _id: userId },
          { $pull: { allUserReviews: reviewId } }
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
