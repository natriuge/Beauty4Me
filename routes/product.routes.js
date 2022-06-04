const router = require("express").Router();
const axios = require("axios");

const ProductModel = require("../models/Product.model");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model");

// Rota de produtos sem auth
// // router.post("/product", async (req, res) => {
// //   try {
// //     const data = req.body;
// //     const result = await ProductModel.create({ ...data });

// //     return res.status(201).json(result);
// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ msg: "Internal server error." });
// //   }
// //
// });

// pegar as infos das rotas da api da sephora
//acessar

// function getProductsSearchList() {
//   const result = await axios.get("https://sephora.p.rapidapi.com/products/");
// };
// console.log( getProductsSearchList();)

// const objGetProductsSearchListSephoraApi = {
//   method: "GET",
//   url: "https://sephora.p.rapidapi.com/products/search",
//   params: { q: "skincare", pageSize: "60", currentPage: "1" },
//   headers: {
//     "X-RapidAPI-Host": "sephora.p.rapidapi.com",
//     "X-RapidAPI-Key": "e116d9383bmshc833e5efafe1044p1ce658jsn59781957b0e7",
//   },
// };

// axios
//   .request(objGetProductsSearchListSephoraApi)
//   .then(function (response) {
//     console.log("AQUI", response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });

let productsCategories = ["toner", "vitamin C"];

async function exec(category) {
  const categoryResList = await connectSearchApiSephora(category);

  for (categoryRes of categoryResList) {
    const categoryResDetails = await connectDetailsApiSephora(
      categoryRes.productId_sephora,
      categoryRes.preferedSku
    );
    let RESPOSTA = mapper_details(categoryRes, categoryResDetails);
    console.log("HOLA QUE TAL", RESPOSTA);
  }
}

async function init() {
  for (let category of productsCategories) {
    await exec(category);
  }
}

async function connectSearchApiSephora(searchParam) {
  try {
    const response = await axios.request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/products/search",
      params: { q: searchParam, pageSize: "5", currentPage: "1" },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": "e116d9383bmshc833e5efafe1044p1ce658jsn59781957b0e7",
      },
    });
    let productList = [...response.data.products];
    return productList.map((product) =>
      mapper_search_allTypes_products(product)
    );
  } catch (error) {
    console.error(error);
  }
}

function connectDetailsApiSephora(productId, preferedSku) {
  return axios
    .request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/products/detail",
      params: { productId: productId, preferedSku: preferedSku },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": "e116d9383bmshc833e5efafe1044p1ce658jsn59781957b0e7",
      },
    })
    .then(function (response) {
      // console.log("AQUI", response.data);
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

// const toner = connectApiSephora("Toner");
// const moisturizing = connectApiSephora("moisturizing");

// SUGESTÃO => arquivo separado os mappers
function getCategoryTranslation(batata) {
  if (batata.toLowerCase().indexOf("peel") > -1) {
    return "peel";
  } else if (batata.toLowerCase().indexOf("soap") > -1) {
    return "soap";
  } else if (batata.toLowerCase().indexOf("moisture") > -1) {
    return "moisture";
  } else {
    return batata;
  }
}

function mapper_search_allTypes_products(obj_search) {
  return {
    productName: obj_search.displayName,
    imageDetails: obj_search.image450,
    imageIcon: obj_search.image135,
    shortDescription: "",
    longDescription: "",
    brandName: obj_search.brandName,
    howToUse: "",
    ingredients: "",
    rating: Number(Number(obj_search.rating).toFixed(2)),
    averagePrice: obj_search.currentSku.listPrice,
    productSkinType: "oil",
    category: getCategoryTranslation(obj_search.displayName),
    productId_sephora: obj_search.productId,
    preferedSku: obj_search.currentSku.skuId,
  };
}

function mapper_details(obj_search, obj_details) {
  return {
    ...obj_search,
    shortDescription: obj_details.shortDescription,
    longDescription: obj_details.longDescription,
    howToUse: obj_details.suggestedUsage,
    ingredients: obj_details.currentSku.ingredientDesc,
  };
}

init();
// router.get("/product/search", async (req, res) => {
//   try {
//     const result = await ProductModel.findOne({ _id });

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// router.get("/product/", async (req, res) => {
//   try {
//     const result = await ProductModel.find({ _id }); //

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });
// //   try {
// //

// const { _id } = req.params;

//     const result = await ProductModel.findOne({ _id });

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// // Rota de produtos favoritos
// router.post("/product", isAuthenticated, async (req, res) => {
//   try {
//     // Extraindo o id do usuário logado
//     const { _id } = req.user;
//     const result = await Product.create({ ...req.body, ownerId: _id });

//     return res.status(201).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// // GET
// router.get("/room", isAuthenticated, async (req, res) => {
//   try {
//     const result = await Room.find();

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// router.get("/room/:_id", isAuthenticated, async (req, res) => {
//   try {
//     const { _id } = req.params;

//     const result = await Room.findOne({ _id })
//       .populate("reviews") // carregar todos os objetos de review no lugar de somente os ids
//       .populate("ownerId", "-passwordHash"); // carregar todos os dados de usuário no lugar de somente o id, porém não enviar a senha

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// router.patch("/room/:_id", isAuthenticated, async (req, res) => {
//   try {
//     const { _id } = req.params;

//     const result = await Room.findOneAndUpdate(
//       { _id },
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     return res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

// router.delete("/room/:_id", isAuthenticated, async (req, res) => {
//   try {
//     const { _id } = req.params;

//     // Deleta a acomodação
//     const result = await Room.findOneAndDelete({ _id }, { new: true });

//     // Deleta todos os reviews dessa acomodação
//     await Review.deleteMany({ roomId: _id });

//     return res.status(200).json({});
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ msg: "Internal server error." });
//   }
// });

module.exports = router;
