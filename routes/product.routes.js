const router = require("express").Router();
const axios = require("axios");
const { text } = require("express");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");

const isAuthenticated = require("../middlewares/isAuthenticated");

//variavel onde vamos colocar todas as nossas categorias de produtos
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
  "toner",
  "sunscreen",
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
    // console.log("MUNDO MARAVILHOSO E LINDO", productDetails);

    const resultForBD = await ProductModel.create({ ...productDetails });
    console.log(resultForBD);
  }
}

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
      params: { q: searchParam, pageSize: "10", currentPage: "1" },
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
      params: { ProductId: ProductId, Limit: "10", Offset: "0" },
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

// Separando os produtos por categoria
function getCategoryTranslation(elem) {
  if (elem.toLowerCase().indexOf("cleanser") > -1) {
    return "cleanser";
  } else if (elem.toLowerCase().indexOf("moisturizing") > -1) {
    return "moisturizing";
  } else if (elem.toLowerCase().indexOf("hyaluronic acid") > -1) {
    return "hyaluronic acid";
  } else if (elem.toLowerCase().indexOf("niacinamide acid") > -1) {
    return "niacinamide acid";
  } else if (elem.toLowerCase().indexOf("glycolic acid") > -1) {
    return "glycolic acid";
  } else if (elem.toLowerCase().indexOf("vitamin C") > -1) {
    return "vitamin C";
  } else if (elem.toLowerCase().indexOf("mandelic acid") > -1) {
    return "mandelic acid";
  } else if (elem.toLowerCase().indexOf("eye cream") > -1) {
    return "eye cream";
  } else if (elem.toLowerCase().indexOf("mask") > -1) {
    return "mask";
  } else if (elem.toLowerCase().indexOf("toner") > -1) {
    return "toner";
  } else if (elem.toLowerCase().indexOf("sunscreen") > -1) {
    return "sunscreen";
  } else {
    return elem;
  }
}

// essa é a função que mapeia o objeto que vamos receber, trazendo apenas as informações que queremos utilizar no nosso projeto(infos do produto)
function mapper_search_allTypes_products(obj_search) {
  return {
    productName: (obj_search || {}).displayName || "Not available",
    imageDetails: (obj_search || {}).image450 || "Not available",
    imageIcon: (obj_search || {}).image135 || "Not available",
    shortDescription: "",
    longDescription: "",
    brandName: (obj_search || {}).brandName || "Not available",
    howToUse: "",
    ingredients: "",
    rating: Number(Number(obj_search.rating).toFixed(2)) || "Not available",
    averagePrice:
      ((obj_search || {}).currentSku || {}).listPrice || "Not available",
    category: getCategoryTranslation(obj_search.displayName),
    productId_sephora: (obj_search || {}).productId || "Not available",
    preferedSku: ((obj_search || {}).currentSku || {}).skuId || "Not available",
  };
}

//fução mapper da rota de detalhes do produto;
function mapper_details_reviews(obj_search, obj_details, obj_reviews) {
  return {
    ...obj_search, //retornando o nosso obj da rota search e acrescentando também os detalhes que estavam em outra rota(rota de details).
    shortDescription: (obj_details || {}).shortDescription || "Not available",
    longDescription: (obj_details || {}).longDescription || "Not available",
    howToUse: (obj_details || {}).suggestedUsage || "Not available",
    ingredients:
      ((obj_details || {}).currentSku || {}).ingredientDesc || "Not available",
    sephoraReviews: obj_reviews || {} || "Not available",
  };
}

function mapper_reviews(obj_reviews) {
  return {
    UserNickname: (obj_reviews || {}).UserNickname || "Not available",
    Rating: (obj_reviews || {}).Rating || "Not available",
    ReviewText: (obj_reviews || {}).ReviewText || "Not available",
    ProductId: (obj_reviews || {}).ProductId || "Not available",
  };
}
//pegar o obj vindo da api e passar por cada review e dps jogar isso no map

// init();

//ROTAS DOS PRODUTOS

//GET - find (ranking)
router.get("/products", async (req, res) => {
  try {
    const result = await ProductModel.find().sort({ rating: -1 });

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
      // .populate("userReviews", "-authorId")
      .populate({
        path: "userReviews",
        model: "Review",
        select: "-authorId -productId",
      })
      .populate("favoritedBy");

    if (!product) {
      return res.status(404).json({ msg: "Product not found!" });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
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
          favoriteProducts: ObjectId(result._id),
        },
      }
    );
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error." });
  }
});

//GET- Barra de search
router.get("/product-search", async (req, res) => {
  try {
    const searchString = req.query.q;
    console.log(searchString.q);
    console.log(req.query);
    const result = await ProductModel.find({
      $text: { $search: searchString },
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "product not found" });
  }
});

router.get("/specific-product/:_id", async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("productId", productId);

    const product = await ProductModel.findOne({ productId });
    // // .populate("userReviews", "-authorId")
    // .populate({
    //   path: "userReviews",
    //   model: "Review",
    //   select: "-authorId -productId",
    // })
    // .populate("favoritedBy");

    if (!product) {
      return res.status(404).json({ msg: "Product not found!" });
    }

    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
