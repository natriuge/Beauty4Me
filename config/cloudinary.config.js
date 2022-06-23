const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Não esquecer de criar as variáveis de ambiente no .env com as chaves da API do Cloudinary
//Autenticar na API do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//Criar uma instância do multer-storage-cloudinary (no express chama storage) configurando como os arquivos serão evniados e armazanados no servidos de arquivos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pictures-Beauty4Me", // nome da pasta que irá armazenar seus arquivos no Cloudinary
    // Na opção format podemos escolher o formato resultante da imagem que será armazenada no Cloudinary
    format: async (req, file) => "png",
    use_filename: true, // nome do arquivo da foto uploaded by the user será o mesmo no meu cloudinary
  },
});

const uploadCloud = multer({ storage: storage }); //essa invocação nos retorna um middleware

module.exports = uploadCloud;
