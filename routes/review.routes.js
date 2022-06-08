const router = require("express").Router();

const ReviewModel = require("../models/Review.model");
const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");

//rota de criar uma review (post)
router.post("/review", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.user;

    const { productId } = req.body;

    // Adicionar referência do review criado no modelo da acomodação

    await ProductModel.updateOne(
      { _id: productId },
      { $push: { reviews: result._id } }
    ); // Como não precisamos incluir na resposta o resultado dessa consulta, podemos usar o updateOne que tem a sintaxe mais simples do que o findOneAndUpdate

    // Adicionar referência do review criado no modelo do usuário

    await UserModel.updateOne({ _id }, { $push: { reviews: result._id } });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

//rota de atualizar uma review (patch)-> VERIFICAR DE O ID DO DONO DO REVIEW É DO MESMO DO USER
//LEMBRAR DE AUTENTICAR TUDO

// rota de deletar uma review (delete) -> VERIFICAR DE O ID DO DONO DO REVIEW É DO MESMO DO USER
//LEMBRAR DE AUTENTICAR TUDO

module.exports = router;
