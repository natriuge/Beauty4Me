const router = require("express").Router();
const bcrypt = require("bcryptjs");

const UserModel = require("../models/User.model");
const generateToken = require("../config/jwt.config");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const salt_rounds = 10;

const uploader = require("../config/cloudinary.config");

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post("/signup", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  console.log("WHY GOD WHY", req.body);

  try {
    // Recuperar a senha que está vindo do corpo da requisição
    const { name, email, password, userSkinType } = req.body;

    // Verifica se o nome não está em branco
    if (!name) {
      // O código 400 significa Bad Request
      console.log("NAME", name);
      return res.status(400).json({
        name: "Name is required! Please, complete the form.",
      });
    }

    // Verifica se o email não está em branco ou se o email não é válido
    if (
      !email ||
      !email.match(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/)
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        email: "Email is required and must be a valid email address",
      });
    }

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        password:
          "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // Verifica se a userSkinType não está em branco
    if (!userSkinType) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        userSkinType: "Skin Type is required!",
      });
    }

    // Gera o salt
    const salt = await bcrypt.genSalt(salt_rounds);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Extraindo o email e senha do corpo da requisição
    const { email, password } = req.body;

    // Pesquisar esse usuário no banco pelo email
    const user = await UserModel.findOne({ email });

    console.log(user);

    if (
      !email ||
      !email.match(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/)
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        notEmail: "Email is required and must be a valid email address",
      });
    }

    // Se o usuário não foi encontrado, significa que ele não é cadastrado
    if (!user) {
      return res.status(400).json({
        notRegister:
          "This email is not yet registered in our website. Please, go to Sign Up!",
      });
    }

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (!password) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        loginPassword: "Password is required.",
      });
    }

    // Verificar se a senha do usuário pesquisado bate com a senha recebida pelo formulário

    if (await bcrypt.compare(password, user.passwordHash)) {
      // Gerando o JWT com os dados do usuário que acabou de logar
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
        },
        token,
      });
    } else {
      // 401 Significa Unauthorized
      return res.status(401).json({ wrongPassord: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar dados do usuário
router.get("/profile", isAuthenticated, attachCurrentUser, (req, res) => {
  console.log(req.headers);

  try {
    // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
      // const result = await UserModel.findOne({loggedInUser}).populate("favorites")

      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(loggedInUser);
    } else {
      return res.status(404).json({ msg: "User not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

//rota upload imagem do profile
router.post(
  "/upload",
  isAuthenticated,
  uploader.single("profilePicture"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(500)
        .json({ msgUpload: "It was not possible to upload your file" });
    }

    return res.status(201).json({ fileUrl: req.file.path });
  }
);

module.exports = router;
