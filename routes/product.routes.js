const router = require("express").Router();
const axios = require("axios");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const ProductModel = require("../models/Product.model");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model");


// variavel onde vamos colocar todas as nossas categorias de produtos
let productsCategories = [
  "cleanser",
  "moisturizing",
  "hyaluronic acid",
  "niacinamide acid",
  "glycolic acid",
  "vitamin C",
  "mandelic acid",
  "eye cream",
  "mask",
];
//chamando a nossa função que se conecta com a api e passando o parametro de busca (que é cada categoria das nossa lista de categorias) => será o nosso searchParam da função "connectSearchApiSephora"
async function exec(category) {
  const categoryResList = await connectSearchApiSephora(category);
  //category é o params de pesquisa da connectSearchApiSephora
  for (categoryRes of categoryResList) {
    //categoryRes é um objeto individual
    //categoryResList é o conjunto de objetos
    const categoryResDetails = await connectDetailsApiSephora(
      categoryRes.productId_sephora, // buscando na categoria o id de cada produto dessa categoria
      categoryRes.preferedSku // buscando na categoria o preferedsku
    );
    const categoryResReviews = await connectReviewsApiSephora(
      categoryRes.productId_sephora
    );
    let productReviews = [];
    for (result of categoryResReviews.Results) {
      productReviews.push(mapper_reviews(result));
    }
    // console.log("productReviews", productReviews);

    let productDetails = mapper_details_reviews(
      categoryRes,
      categoryResDetails,
      productReviews
    ); // passando no nosso mapper dos detalhes esses dois parametros para receber nosso obj "bonitinho" com os detalhes que queremos de cada produto.
    console.log("MUNDO MARAVILHOSO E LINDO", productDetails);

const isAuthenticated = require("../middlewares/isAuthenticated");
//variavel onde vamos colocar todas as nossas categorias de produtos

// let productsCategories = [
//   "cleanser",
//   "moisturizing",
//   "hyaluronic acid",
//   "niacinamide acid",
//   "glycolic acid",
//   "vitamin C",
//   "mandelic acid",
//   "eye cream",
//   "mask",
// ];
// //chamando a nossa função que se conecta com a api e passando o parametro de busca (que é cada categoria das nossa lista de categorias) => será o nosso searchParam da função "connectSearchApiSephora"
// async function exec(category) {
//   const categoryResList = await connectSearchApiSephora(category);
//   //category é o params de pesquisa da connectSearchApiSephora
//   for (categoryRes of categoryResList) {
//     //categoryRes é um objeto individual
//     //categoryResList é o conjunto de objetos
//     const categoryResDetails = await connectDetailsApiSephora(
//       categoryRes.productId_sephora, // buscando na categoria o id de cada produto dessa categoria
//       categoryRes.preferedSku // buscando na categoria o preferedsku
//     );
//     const categoryResReviews = await connectReviewsApiSephora(
//       categoryRes.productId_sephora
//     );
//     let productReviews = [];
//     for (result of categoryResReviews.Results) {
//       productReviews.push(mapper_reviews(result));
//     }
//     // console.log("productReviews", productReviews);

//     let productDetails = mapper_details_reviews(
//       categoryRes,
//       categoryResDetails,
//       productReviews
//     ); // passando no nosso mapper dos detalhes esses dois parametros para receber nosso obj "bonitinho" com os detalhes que queremos de cada produto.
//     // console.log("MUNDO MARAVILHOSO E LINDO", productDetails);

//     // const resultForBD = await ProductModel.create({ ...productDetails });
//     // console.log(resultForBD);
//   }
// }

//configuração para conexão com a rota search da api da Sephora
async function connectSearchApiSephora(searchParam) {
  try {
    const response = await axios.request({
      method: "GET",
      url: "https://sephora.p.rapidapi.com/products/search",
      //params: "chave" de busca dinâmica;
      params: { q: searchParam, pageSize: "5", currentPage: "1" },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
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
        "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      },
    })
    .then(function (response) {
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
      params: { ProductId: ProductId, Limit: "5", Offset: "0" },
      headers: {
        "X-RapidAPI-Host": "sephora.p.rapidapi.com",
        "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

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

function getSkinTypeTranslation(batata) {
  if (batata.toLowerCase().indexOf("normal") > -1) {
    return "normal";
  } else if (batata.toLowerCase().indexOf("dry") > -1) {
    return "dry";
  } else if (batata.toLowerCase().indexOf("oily") > -1) {
    return "oily";
  } else if (batata.toLowerCase().indexOf("combination") > -1) {
    return "combination";
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
    category: getCategoryTranslation(obj_search.displayName),
    productId_sephora: obj_search.productId,
    preferedSku: obj_search.currentSku.skuId,
  };
}

//fução mapper da rota de detalhes do produto;
function mapper_details_reviews(obj_search, obj_details, obj_reviews) {
  return {
    ...obj_search, //retornando o nosso obj da rota search e acrescentando também os detalhes que estavam em outra rota(rota de details).
    shortDescription: obj_details.shortDescription,
    longDescription: obj_details.longDescription,
    howToUse: obj_details.suggestedUsage,
    ingredients: obj_details.currentSku.ingredientDesc,
    sephoraReviews: obj_reviews,
    productSkinType: getSkinTypeTranslation(obj_details.shortDescription),
  };
}

// //essa função de init faz um loop na nossa array de categorias passando por cada uma;
// async function init() {
//   for (let category of productsCategories) {
//     await exec(category);
//   }
// }

// //configuração para conexão com a rota search da api da Sephora
// async function connectSearchApiSephora(searchParam) {

//   try {
//     const response = await axios.request({
//       method: "GET",
//       url: "https://sephora.p.rapidapi.com/products/search",
//       //params: "chave" de busca dinâmica;
//       params: { q: searchParam, pageSize: "5", currentPage: "1" },
//       headers: {
//         "X-RapidAPI-Host": "sephora.p.rapidapi.com",
//         "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
//       },
//     }); //variavel que pega os produtos retornados na response
//     let productList = [...response.data.products];
//     //cada produto sendo iterado e retornado "bonitinho" através da função mapper que trás apenas os dados que precisamos pro proj;
//     return productList.map((product) =>
//       mapper_search_allTypes_products(product)
//     );
//   } catch (error) {
//     console.error(error);
//   }
// }
// //configuração para conexão com a rota details da api da Sephora
// function connectDetailsApiSephora(productId, preferedSku) {
//   return axios
//     .request({
//       method: "GET",
//       url: "https://sephora.p.rapidapi.com/products/detail",
//       //params: "id" do produto de dinâmico;
//       params: { productId: productId, preferedSku: preferedSku },
//       headers: {
//         "X-RapidAPI-Host": "sephora.p.rapidapi.com",
//         "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
//       },
//     })
//     .then(function (response) {
//       return response.data;
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// }

// function connectReviewsApiSephora(ProductId) {
//   return axios
//     .request({
//       method: "GET",
//       url: "https://sephora.p.rapidapi.com/reviews/list",
//       params: { ProductId: ProductId, Limit: "5", Offset: "0" },
//       headers: {
//         "X-RapidAPI-Host": "sephora.p.rapidapi.com",
//         "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
//       },
//     })
//     .then(function (response) {
//       return response.data;
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// }

// // SUGESTÃO => arquivo separado os mappers
// function getCategoryTranslation(batata) {
//   if (batata.toLowerCase().indexOf("peel") > -1) {
//     return "peel";
//   } else if (batata.toLowerCase().indexOf("soap") > -1) {
//     return "soap";
//   } else if (batata.toLowerCase().indexOf("moisture") > -1) {
//     return "moisture";
//   } else {
//     return batata;
//   }
// }
// // essa é a função que mapeia o objeto que vamos receber, trazendo apenas as informações que queremos utilizar no nosso projeto(infos do produto)
// function mapper_search_allTypes_products(obj_search) {
//   return {
//     productName: obj_search.displayName,
//     imageDetails: obj_search.image450,
//     imageIcon: obj_search.image135,
//     shortDescription: "",
//     longDescription: "",
//     brandName: obj_search.brandName,
//     howToUse: "",
//     ingredients: "",
//     rating: Number(Number(obj_search.rating).toFixed(2)),
//     averagePrice: obj_search.currentSku.listPrice,
//     productSkinType: "oil", //categoryTranslation do skin type !!!!!! TO DO
//     category: getCategoryTranslation(obj_search.displayName),
//     productId_sephora: obj_search.productId,
//     preferedSku: obj_search.currentSku.skuId,
//   };
// }


// //fução mapper da rota de detalhes do produto;
// function mapper_details_reviews(obj_search, obj_details, obj_reviews) {
//   return {
//     ...obj_search, //retornando o nosso obj da rota search e acrescentando também os detalhes que estavam em outra rota(rota de details).
//     shortDescription: obj_details.shortDescription,
//     longDescription: obj_details.longDescription,
//     howToUse: obj_details.suggestedUsage,
//     ingredients: obj_details.currentSku.ingredientDesc,
//     sephoraReviews: obj_reviews,
//   };
// }

// function mapper_reviews(obj_reviews) {
//   return {
//     UserNickname: obj_reviews.UserNickname,
//     Rating: obj_reviews.Rating,
//     ReviewText: obj_reviews.ReviewText,
//     ProductId: obj_reviews.ProductId,
//   };
// }
// //pegar o obj vindo da api e passar por cada review e dps jogar isso no map

// init();

//GET - find

router.get("/products", async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = Number(page) || 0;
    limit = Number(limit) || 20;

    const result = await ProductModel.find()
      .skip(page * limit)
      .limit(limit)
      .sort({ rating: -1 });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

//GET - findOne
router.get("/product/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    const product = await ProductModel.findOne({ _id })
      .populate("allProductReviews", "-authorId productId")
      .populate("favoritedBy");

    if (!product) {
      return res.status(404).json({ msg: "Product not found!" });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "failed to find product." });
  }
});

//rota de favoritar (produto)
router.patch("/product/:productId", isAuthenticated, async (req, res) => {
  try {
    const { _id } = req.user;

    const { productId } = req.params;

    const result = await ProductModel.findOne({
      _id: ObjectId(productId),
    });

    await UserModel.updateOne(
      { _id },
      {
        $addToSet: {
          favoriteProducts: ObjectId(result._id)
        }
      }
    );
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

module.exports = router;


//post inserindo

// router.?("/",  isAuthenticaded , async (req, res) => {
//   const {_id} =  req.params;

//   const favoriteProduct = await UserModel.//push()

//rota do ranking-> maior para o menorr;

//comentário teste

