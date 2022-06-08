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

// //rota de atualizar uma review (patch)
// router.patch("/review", isAuthenticated, async (req, res) => {
//   try {
//     const { _id } = req.user;

//     const { productId } = req.body;

//     const { authorId } = req.body;

//     // Verifica se a review que vai ser atualizada não é de propriedade do usuário logado
//     const user = await UserModel.findOne({
//       _id,
//       allUserReviews: { $not: { $in: [authorId] } },
//     });

//     console.log(user);

//     // Usuários não podem atualizar um review de própria autoria
//     if (user) {
//       const result = await ReviewModel.findOneAndUpdate(
//   { _id, ownerId: userId },
//   { $set: data },
//   { new: true, runValidators: true }
// );

//       // Adicionar referência do review criado no modelo da acomodação

//       await ProductModel.updateOne(
//         { _id: productId },
//         { $push: { allProductReviews: result._id } }
//       ); // Como não precisamos incluir na resposta o resultado dessa consulta, podemos usar o updateOne que tem a sintaxe mais simples do que o findOneAndUpdate

//       // Adicionar referência do review criado no modelo do usuário

//       await UserModel.updateOne(
//         { _id },
//         { $push: { allUserReviews: result._id } }
//       );

//        return res.status(201).json(result);
//     }

//     // 400: Bad Request
//     return res
//       .status(400)
//       .json({ msg: "Você não pode avaliar sua própria acomodação!" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

//rota de atualizar uma review (patch)-> VERIFICAR DE O ID DO DONO DO REVIEW É DO MESMO DO USER
//LEMBRAR DE AUTENTICAR TUDO

// rota de deletar uma review (delete) -> VERIFICAR DE O ID DO DONO DO REVIEW É DO MESMO DO USER
//LEMBRAR DE AUTENTICAR TUDO

module.exports = router;

//omg
