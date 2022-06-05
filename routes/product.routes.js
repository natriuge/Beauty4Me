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

//variavel onde vamos colocar todas as nossas categorias de produtos
let productsCategories = ["toner", "vitamin C"];
//chamando a nossa função que se conecta com a api e passando o parametro de busca (que é cada categoria das nossa lista de categorias) => será o nosso searchParam da função "connectSearchApiSephora"
async function exec(category) {
  const categoryResList = await connectSearchApiSephora(category); //category é o params de pesquisa da connectSearchApiSephora
  for (categoryRes of categoryResList) {
    const categoryResDetails = await connectDetailsApiSephora(
      categoryRes.productId_sephora, // buscando na categoria o id de cada produto dessa categoria
      categoryRes.preferedSku // buscando na categoria o preferedsku
    );
    let RESPOSTA = mapper_details(categoryRes, categoryResDetails);// passando no nosso mapper dos detalhes esses dois parametros para receber nosso obj "bonitinho" com os detalhes que queremos de cada produto.
    // console.log("HOLA QUE TAL", RESPOSTA);
  }
} 
//função que tá cagada (por enquanto):

// async function execRev(category) {
//  const categoryResList = await connectSearchApiSephora(category); 
//  for (categoryRes of categoryResList) {
//    const categoryResReviews = await connectReviewsApiSephora(
//      categoryRes.productId
//    );
//      let RESPOSTAB = mapper_reviews(categoryRes, categoryResReviews); //essa variavel será a nossa resposta com o obj do review
//      console.log("oi", RESPOSTAB);
//  }
// }

//essa função de init faz um loop na nossa array de categorias passando por cada uma;
async function init() {
  for (let category of productsCategories) {
    await exec(category);
  }
}
//configuração para conexão com a rota search da api da Sephora
async function connectSearchApiSephora(searchParam) {
  try {
    const response = await axios.request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/products/search",
      //params: "chave" de busca dinâmica;
      params: { q: searchParam, pageSize: "60", currentPage: "1" },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": "740818ed14msh8a6a37593e82ec7p18db7ajsn40133cedf6ec",
      },
    }); //variavel que pega os produtos retornados na response
    let productList = [...response.data.products];
    //cada produto sendo iterado e retornado "bonitinho" através da função mapper que trás apenas os dados que precisamos pro proj;
    return productList.map((product) =>
      mapper_search_allTypes_products(product)
    );
  } catch (error) {
    console.error(error);
  }
}
//configuração para conexão com a rota details da api da Sephora
function connectDetailsApiSephora(productId, preferedSku) {
  return axios
    .request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/products/detail",
      //params: "id" do produto de dinâmico;
      params: { productId: productId, preferedSku: preferedSku },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": "740818ed14msh8a6a37593e82ec7p18db7ajsn40133cedf6ec",
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

function connectReviewsApiSephora(ProductId) {
  return axios
    .request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/reviews/list",
      params: { ProductId: ProductId, Limit: "60", Offset: "0" },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": "740818ed14msh8a6a37593e82ec7p18db7ajsn40133cedf6ec",
      },
    })
    .then(function (response) {
      // console.log("oxente", response.data);
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}    
// let testId = "P427406";
// connectReviewsApiSephora(testId)


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
// essa é a função que mapeia o objeto que vamos receber, trazendo apenas as informações que queremos utilizar no nosso projeto(infos do produto)
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
//fução mapper da rota de detalhes do produto; 
function mapper_details(obj_search, obj_details) {
  return {
    ...obj_search, //retornando o nosso obj da rota search e acrescentando também os detalhes que estavam em outra rota(rota de details).
    shortDescription: obj_details.shortDescription,
    longDescription: obj_details.longDescription,
    howToUse: obj_details.suggestedUsage,
    ingredients: obj_details.currentSku.ingredientDesc,
  };
}

function mapper_reviews(obj_reviews){
  return {
    UserNickname: obj_reviews.UserNickname,
    Rating: obj_reviews.Rating,
    ReviewText: obj_reviews.ReviewText,
    ProductId: obj_reviews.ProductId,
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
