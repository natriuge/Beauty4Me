require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("./config/db.config")();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
// Não esquecer de criar variável de ambiente com o endereço do seu app React (local ou deployado no Netlify)
app.use(cors({ origin: process.env.REACT_APP_URL }));

// const db = require("./config/db.config");
// db()
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log("Servidor rodando na porta ", process.env.PORT);
//     });
//   })
//   .catch((err) => console.error(err));

//tá frio!

const userRouter = require("./routes/user.routes");
app.use("/api", userRouter);
const productRouter = require("./routers/product.router");
app.use("/", productRouter);
const reviewRouter = require("./routers/review.router");
app.use("/", reviewRouter);
// Oi gente
app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);

//Nathalia- this comment is to test my branch